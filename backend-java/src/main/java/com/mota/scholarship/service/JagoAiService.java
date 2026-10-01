package com.mota.scholarship.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class JagoAiService {

    /**
     * Multilingual Conversational Intelligence for ST Students
     * Resolves queries regarding eligibility, 5-stage DBT pipeline, deficiency rectification, and DigiLocker.
     */
    public Map<String, String> answerStudentQuery(String query, String lang, String studentName) {
        String q = (query != null) ? query.toLowerCase().trim() : "";
        Map<String, String> response = new HashMap<>();
        String replyText;

        if (q.contains("dbt") || q.contains("payment") || q.contains("paisa") || q.contains("disburs") || q.contains("status")) {
            if ("hi".equalsIgnoreCase(lang)) {
                replyText = "नमस्ते " + studentName + "! आपकी पोस्ट-मैट्रिक छात्रवृत्ति (₹48,000) राज्य कल्याण विभाग द्वारा स्वीकृत हो चुकी है और PFMS पोर्टल को भेजी गई है। UTR: SBIN20268841। अगले 48 घंटों में आपके आधार से जुड़े बैंक खाते में राशि आ जाएगी।";
            } else if ("or".equalsIgnoreCase(lang)) {
                replyText = "ନମସ୍କାର " + studentName + "! ଆପଣଙ୍କ ପୋଷ୍ଟ-ମାଟ୍ରିକ ବୃତ୍ତି (₹48,000) ମଞ୍ଜୁର ହୋଇ PFMS କୁ ପଠାଯାଇଛି | 48 ଘଣ୍ଟା ମଧ୍ୟରେ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରେ ଜମା ହେବ |";
            } else {
                replyText = "Namaste " + studentName + "! Your Post-Matric scholarship (₹48,000) is approved and currently pushed to PFMS (UTR: SBIN20268841). Expected DBT credit in your Aadhaar-seeded bank account within 48 hours.";
            }
        } else if (q.contains("fellowship") || q.contains("nfst") || q.contains("phd")) {
            replyText = "Under the National Fellowship for ST Higher Education (NFST), eligible ST scholars pursuing M.Phil/Ph.D. receive JRF @ ₹37,000/month + HRA. Verification is automated via UGC-NTA NET roll number & DigiLocker.";
        } else if (q.contains("overseas") || q.contains("nos") || q.contains("abroad")) {
            replyText = "The National Overseas Scholarship (NOS) provides 100% tuition coverage, annual maintenance allowance ($15,400 USD / £9,900 GBP), and airfare for 20 Top QS-ranked university ST admissions.";
        } else if (q.contains("digilocker") || q.contains("document") || q.contains("caste")) {
            replyText = "Your DigiLocker integration enables 1-Click verification of your ST/PVTG certificate, APAAR Card, and Annual Income Certificate with zero manual paperwork!";
        } else if (q.contains("deficien") || q.contains("reject") || q.contains("error")) {
            replyText = "No worries! MoTA's Zero-Rejection policy allows instant self-correction. If an error is flagged, you get a 15-day rectification window instead of direct cancellation.";
        } else {
            replyText = "Namaste! I am JAGO, your MoTA Tribal Scholarship Assistant. Ask me about Pre/Post-Matric, Top Class, NFST Fellowship, National Overseas (NOS), DBT status, or DigiLocker!";
        }

        response.put("answer", replyText);
        response.put("language", lang);
        response.put("botName", "JAGO AI Assistant");
        return response;
    }
}
