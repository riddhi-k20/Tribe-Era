package com.mota.scholarship.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ScholarshipApplication {
    public enum SchemeType {
        PRE_MATRIC("Pre-Matric Scholarship for ST Students (Class 9-10)", "NSP"),
        POST_MATRIC("Post-Matric Scholarship for ST Students (Class 11 - PG)", "NSP"),
        TOP_CLASS("Top Class Education for ST Students (IITs/IIMs/AIIMS/NLUs)", "NSP"),
        NFST("National Fellowship for Higher Education of ST Students (M.Phil/Ph.D.)", "Canara SFMP"),
        NOS("National Overseas Scholarship for ST Students (Masters/Ph.D. Abroad)", "NOS Standalone");

        private final String displayName;
        private final String legacySourcePortal;

        SchemeType(String displayName, String legacySourcePortal) {
            this.displayName = displayName;
            this.legacySourcePortal = legacySourcePortal;
        }

        public String getDisplayName() { return displayName; }
        public String getLegacySourcePortal() { return legacySourcePortal; }
    }

    public enum ApplicationStatus {
        DRAFT,
        SUBMITTED,
        DIGILOCKER_VERIFIED,
        INSTITUTE_APPROVED,
        STATE_SANCTIONED,
        PFMS_PUSHED,
        DISBURSED,
        DEFICIENT_ACTION_REQUIRED
    }

    private String applicationId;
    private String studentAadhaarVaultId;
    private String apaarId;
    private String studentName;
    private SchemeType schemeType;
    private int academicYear;
    private ApplicationStatus status;
    private BigDecimal sanctionedAmount;
    private String institutionAisheCode;
    private String institutionName;
    private String bankAccountMasked;
    private String ifscCode;
    private boolean npciAadhaarSeeded;
    private String utrNumber;
    private String deficiencyRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public ScholarshipApplication() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    public ScholarshipApplication(String applicationId, String studentAadhaarVaultId, String apaarId,
                                  String studentName, SchemeType schemeType, int academicYear,
                                  ApplicationStatus status, BigDecimal sanctionedAmount,
                                  String institutionName, boolean npciAadhaarSeeded) {
        this.applicationId = applicationId;
        this.studentAadhaarVaultId = studentAadhaarVaultId;
        this.apaarId = apaarId;
        this.studentName = studentName;
        this.schemeType = schemeType;
        this.academicYear = academicYear;
        this.status = status;
        this.sanctionedAmount = sanctionedAmount;
        this.institutionName = institutionName;
        this.npciAadhaarSeeded = npciAadhaarSeeded;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getStudentAadhaarVaultId() { return studentAadhaarVaultId; }
    public void setStudentAadhaarVaultId(String studentAadhaarVaultId) { this.studentAadhaarVaultId = studentAadhaarVaultId; }
    public String getApaarId() { return apaarId; }
    public void setApaarId(String apaarId) { this.apaarId = apaarId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public SchemeType getSchemeType() { return schemeType; }
    public void setSchemeType(SchemeType schemeType) { this.schemeType = schemeType; }
    public int getAcademicYear() { return academicYear; }
    public void setAcademicYear(int academicYear) { this.academicYear = academicYear; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; this.lastUpdated = LocalDateTime.now(); }
    public BigDecimal getSanctionedAmount() { return sanctionedAmount; }
    public void setSanctionedAmount(BigDecimal sanctionedAmount) { this.sanctionedAmount = sanctionedAmount; }
    public String getInstitutionAisheCode() { return institutionAisheCode; }
    public void setInstitutionAisheCode(String institutionAisheCode) { this.institutionAisheCode = institutionAisheCode; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getBankAccountMasked() { return bankAccountMasked; }
    public void setBankAccountMasked(String bankAccountMasked) { this.bankAccountMasked = bankAccountMasked; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public boolean isNpciAadhaarSeeded() { return npciAadhaarSeeded; }
    public void setNpciAadhaarSeeded(boolean npciAadhaarSeeded) { this.npciAadhaarSeeded = npciAadhaarSeeded; }
    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }
    public String getDeficiencyRemarks() { return deficiencyRemarks; }
    public void setDeficiencyRemarks(String deficiencyRemarks) { this.deficiencyRemarks = deficiencyRemarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
}
