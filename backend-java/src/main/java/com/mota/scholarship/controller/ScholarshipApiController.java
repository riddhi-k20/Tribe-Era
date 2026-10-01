package com.mota.scholarship.controller;

import com.mota.scholarship.model.ScholarshipApplication;
import com.mota.scholarship.service.CoverageGapAnalyticsService;
import com.mota.scholarship.service.DeDuplicationEngine;
import com.mota.scholarship.service.JagoAiService;
import com.mota.scholarship.service.UnifiedVerificationGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/scholarships")
@CrossOrigin(origins = "*")
public class ScholarshipApiController {

    @Autowired
    private UnifiedVerificationGatewayService verificationService;

    @Autowired
    private DeDuplicationEngine deDuplicationEngine;

    @Autowired
    private CoverageGapAnalyticsService coverageGapAnalyticsService;

    @Autowired
    private JagoAiService jagoAiService;

    private final List<ScholarshipApplication> inMemoryApps = new ArrayList<>();

    public ScholarshipApiController() {
        // Initialize with realistic mock applications across schemes
        ScholarshipApplication app1 = new ScholarshipApplication(
                "APP-2026-POST-7890",
                "VAULT-AADHAAR-9988-1122",
                "9843-1289-4401",
                "Birsa Munda Jr.",
                ScholarshipApplication.SchemeType.POST_MATRIC,
                2026,
                ScholarshipApplication.ApplicationStatus.PFMS_PUSHED,
                new BigDecimal("48000.00"),
                "Birsa Institute of Technology (BIT Sindri)",
                true
        );
        app1.setUtrNumber("SBIN2026884190");
        app1.setBankAccountMasked("XXXX-XXXX-4891");
        app1.setIfscCode("SBIN0001234");
        inMemoryApps.add(app1);
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<Map<String, String>>> getAllSchemes() {
        List<Map<String, String>> schemes = new ArrayList<>();
        for (ScholarshipApplication.SchemeType type : ScholarshipApplication.SchemeType.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("code", type.name());
            item.put("name", type.getDisplayName());
            item.put("portalSource", type.getLegacySourcePortal());
            schemes.add(item);
        }
        return ResponseEntity.ok(schemes);
    }

    @PostMapping("/verify-documents")
    public ResponseEntity<Map<String, Object>> verifyDocuments(@RequestBody Map<String, String> payload) {
        String apaarId = payload.get("apaarId");
        String casteCert = payload.get("casteCertNo");
        String aisheCode = payload.get("aisheCode");
        String netRoll = payload.get("netRollNo");

        Map<String, Object> result = verificationService.runFullVerification(apaarId, casteCert, aisheCode, netRoll);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyForScheme(@RequestBody Map<String, String> payload) {
        String vaultId = payload.getOrDefault("studentVaultId", "VAULT-AADHAAR-DEFAULT");
        String schemeCode = payload.get("schemeType");
        int academicYear = Integer.parseInt(payload.getOrDefault("academicYear", "2026"));

        ScholarshipApplication.SchemeType schemeType = ScholarshipApplication.SchemeType.valueOf(schemeCode);

        // 1. Run Single-Benefit De-duplication Rule Engine Check
        DeDuplicationEngine.DeDuplicationResult dedup = deDuplicationEngine.validateSchemeApplication(vaultId, academicYear, schemeType, inMemoryApps);

        Map<String, Object> res = new HashMap<>();
        if (!dedup.isEligible()) {
            res.put("success", false);
            res.put("error", dedup.getMessage());
            return ResponseEntity.badRequest().body(res);
        }

        ScholarshipApplication newApp = new ScholarshipApplication(
                "APP-" + academicYear + "-" + schemeType.name().substring(0, 4) + "-" + (1000 + new Random().nextInt(9000)),
                vaultId,
                payload.getOrDefault("apaarId", "9843-1289-4401"),
                payload.getOrDefault("studentName", "Birsa Munda Jr."),
                schemeType,
                academicYear,
                ScholarshipApplication.ApplicationStatus.DIGILOCKER_VERIFIED,
                new BigDecimal(payload.getOrDefault("amount", "48000")),
                payload.getOrDefault("institutionName", "BIT Sindri"),
                true
        );
        inMemoryApps.add(newApp);

        res.put("success", true);
        res.put("application", newApp);
        res.put("message", "Application submitted successfully and auto-verified via DigiLocker!");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ScholarshipApplication>> getAllApplications() {
        return ResponseEntity.ok(inMemoryApps);
    }

    @GetMapping("/gap-analytics")
    public ResponseEntity<List<Map<String, Object>>> getCoverageGapAnalytics() {
        return ResponseEntity.ok(coverageGapAnalyticsService.getDistrictCoverageGaps());
    }

    @PostMapping("/jago-chat")
    public ResponseEntity<Map<String, String>> chatWithJago(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String lang = payload.getOrDefault("lang", "en");
        String name = payload.getOrDefault("studentName", "Scholar");
        return ResponseEntity.ok(jagoAiService.answerStudentQuery(query, lang, name));
    }
}
