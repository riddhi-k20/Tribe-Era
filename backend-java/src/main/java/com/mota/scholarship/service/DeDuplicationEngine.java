package com.mota.scholarship.service;

import com.mota.scholarship.model.ScholarshipApplication;
import com.mota.scholarship.model.ScholarshipApplication.ApplicationStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeDuplicationEngine {

    /**
     * Validates that a tribal student does not claim multiple active maintenance/stipend benefits
     * simultaneously across the 5 schemes, while permitting transitions (e.g. from Pre-Matric to Post-Matric).
     */
    public DeDuplicationResult validateSchemeApplication(String studentVaultId, 
                                                         int academicYear, 
                                                         ScholarshipApplication.SchemeType requestedScheme,
                                                         List<ScholarshipApplication> existingApps) {
        for (ScholarshipApplication app : existingApps) {
            if (app.getStudentAadhaarVaultId().equals(studentVaultId) && app.getAcademicYear() == academicYear) {
                // If an existing scholarship is approved/sanctioned/disbursed
                if (app.getStatus() == ApplicationStatus.DISBURSED ||
                    app.getStatus() == ApplicationStatus.PFMS_PUSHED ||
                    app.getStatus() == ApplicationStatus.STATE_SANCTIONED ||
                    app.getStatus() == ApplicationStatus.INSTITUTE_APPROVED) {

                    if (app.getSchemeType() != requestedScheme) {
                        return new DeDuplicationResult(false, 
                                "Single-Benefit Rule Conflict: Student is already actively enrolled in " 
                                + app.getSchemeType().getDisplayName() + " for academic year " + academicYear 
                                + " (Status: " + app.getStatus() + "). Multiple concurrent central stipends are prohibited.");
                    }
                }
            }
        }
        return new DeDuplicationResult(true, "Eligible for application under " + requestedScheme.getDisplayName());
    }

    public static class DeDuplicationResult {
        private final boolean eligible;
        private final String message;

        public DeDuplicationResult(boolean eligible, String message) {
            this.eligible = eligible;
            this.message = message;
        }

        public boolean isEligible() { return eligible; }
        public String getMessage() { return message; }
    }
}
