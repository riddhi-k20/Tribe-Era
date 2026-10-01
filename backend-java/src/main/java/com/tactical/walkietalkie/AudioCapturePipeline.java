package com.tactical.walkietalkie;

import android.annotation.SuppressLint;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.media.audiofx.NoiseSuppressor;
import android.os.Handler;
import android.os.Looper;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class AudioCapturePipeline {
    public interface AudioPipelineCallback {
        void onAudioChunkCaptured(short[] pcmChunk, float[] floatBlock, float rmsDb);
        void onVadSilenceDetected(float[] completeUtterance);
        void onMaxDurationExceeded(float[] completeUtterance);
        void onCaptureError(String error);
    }

    public static final int SAMPLE_RATE = 16000;
    public static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    public static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    private static final float NOISE_FLOOR_RMS = 0.015f;
    private static final int SILENCE_THRESHOLD_MS = 300;
    private static final int HARD_TIMEOUT_LIMIT_MS = 35000;

    private final AudioPipelineCallback callback;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private AudioRecord audioRecord;
    private NoiseSuppressor noiseSuppressor;
    private ExecutorService captureExecutor;
    private final AtomicBoolean isCapturing = new AtomicBoolean(false);

    private final ByteArrayOutputStream utteranceAccumulator = new ByteArrayOutputStream();
    private long captureStartTimeMs = 0;
    private long silenceStartTimestampMs = 0;

    public AudioCapturePipeline(AudioPipelineCallback callback) {
        this.callback = callback;
    }

    @SuppressLint("MissingPermission")
    public synchronized void startCapture() {
        if (isCapturing.get()) return;

        int minBufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT);
        int bufferSize = Math.max(minBufferSize, 2048);

        try {
            audioRecord = new AudioRecord(
                    MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                    SAMPLE_RATE,
                    CHANNEL_CONFIG,
                    AUDIO_FORMAT,
                    bufferSize
            );

            if (audioRecord.getState() != AudioRecord.STATE_INITIALIZED) {
                callback.onCaptureError("AudioRecord state failed to initialize.");
                return;
            }

            int audioSessionId = audioRecord.getAudioSessionId();
            if (NoiseSuppressor.isAvailable()) {
                noiseSuppressor = NoiseSuppressor.create(audioSessionId);
                if (noiseSuppressor != null) {
                    noiseSuppressor.setEnabled(true);
                }
            }

            utteranceAccumulator.reset();
            captureStartTimeMs = System.currentTimeMillis();
            silenceStartTimestampMs = 0;

            audioRecord.startRecording();
            isCapturing.set(true);
            captureExecutor = Executors.newSingleThreadExecutor();
            captureExecutor.execute(this::processingLoop);

        } catch (Exception ex) {
            isCapturing.set(false);
            callback.onCaptureError("Audio capture startup failed: " + ex.getMessage());
            releaseResources();
        }
    }

    private void processingLoop() {
        int readChunkSize = 640; // 40ms frame @ 16kHz
        short[] shortBuffer = new short[readChunkSize];
        byte[] byteBuffer = new byte[readChunkSize * 2];
        float[] floatBlock = new float[readChunkSize];

        while (isCapturing.get() && audioRecord != null) {
            int shortsRead = audioRecord.read(shortBuffer, 0, readChunkSize);
            if (shortsRead <= 0) continue;

            double sumSquares = 0.0;
            for (int i = 0; i < shortsRead; i++) {
                short s = shortBuffer[i];
                float norm = s / 32768.0f;
                floatBlock[i] = norm;
                sumSquares += (norm * norm);

                byteBuffer[i * 2] = (byte) (s & 0xFF);
                byteBuffer[i * 2 + 1] = (byte) ((s >> 8) & 0xFF);
            }

            synchronized (utteranceAccumulator) {
                utteranceAccumulator.write(byteBuffer, 0, shortsRead * 2);
            }

            float rms = (float) Math.sqrt(sumSquares / shortsRead);
            float rmsDb = (rms > 0.0001f) ? (float) (20.0 * Math.log10(rms)) : -80.0f;

            float[] dispatchedBlock = new float[shortsRead];
            System.arraycopy(floatBlock, 0, dispatchedBlock, 0, shortsRead);
            short[] dispatchedShorts = new short[shortsRead];
            System.arraycopy(shortBuffer, 0, dispatchedShorts, 0, shortsRead);

            mainHandler.post(() -> callback.onAudioChunkCaptured(dispatchedShorts, dispatchedBlock, rmsDb));

            long now = System.currentTimeMillis();
            if (now - captureStartTimeMs > HARD_TIMEOUT_LIMIT_MS) {
                float[] utterance = getAccumulatedUtterance();
                stopCapture();
                mainHandler.post(() -> callback.onMaxDurationExceeded(utterance));
                break;
            }

            if (rms < NOISE_FLOOR_RMS) {
                if (silenceStartTimestampMs == 0) {
                    silenceStartTimestampMs = now;
                } else if (now - silenceStartTimestampMs > SILENCE_THRESHOLD_MS && utteranceAccumulator.size() > 16000) {
                    float[] utterance = getAccumulatedUtterance();
                    stopCapture();
                    mainHandler.post(() -> callback.onVadSilenceDetected(utterance));
                    break;
                }
            } else {
                silenceStartTimestampMs = 0;
            }
        }
    }

    private float[] getAccumulatedUtterance() {
        byte[] bytes;
        synchronized (utteranceAccumulator) {
            bytes = utteranceAccumulator.toByteArray();
        }
        int sampleCount = bytes.length / 2;
        float[] samples = new float[sampleCount];
        for (int i = 0; i < sampleCount; i++) {
            short val = (short) ((bytes[i * 2] & 0xFF) | (bytes[i * 2 + 1] << 8));
            samples[i] = val / 32768.0f;
        }
        return samples;
    }

    public synchronized void stopCapture() {
        if (!isCapturing.get()) return;
        isCapturing.set(false);
        releaseResources();
    }

    private void releaseResources() {
        try {
            if (audioRecord != null) {
                if (audioRecord.getState() == AudioRecord.STATE_INITIALIZED) {
                    audioRecord.stop();
                }
                audioRecord.release();
                audioRecord = null;
            }
            if (noiseSuppressor != null) {
                noiseSuppressor.release();
                noiseSuppressor = null;
            }
            if (captureExecutor != null) {
                captureExecutor.shutdownNow();
                captureExecutor = null;
            }
        } catch (Exception ignored) {}
    }
}
