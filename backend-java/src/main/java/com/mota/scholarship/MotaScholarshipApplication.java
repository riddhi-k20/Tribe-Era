package com.mota.scholarship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MotaScholarshipApplication {
    public static void main(String[] args) {
        SpringApplication.run(MotaScholarshipApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("🏛️ MoTA Unified Scholarship Backend Gateway Started (Port 8080)");
        System.out.println("==========================================================");
    }
}
