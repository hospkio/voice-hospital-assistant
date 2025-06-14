
import { DepartmentService, type Department } from './DepartmentService';
import { DoctorService, type Doctor } from './DoctorService';
import { HospitalInfoService, type HospitalInfo } from './HospitalInfoService';
import { MultilingualResponseService, type MultilingualResponse } from './MultilingualResponseService';
import { LoggingService } from './LoggingService';

class HospitalDataService {
  private departmentService = new DepartmentService();
  private doctorService = new DoctorService();
  private hospitalInfoService = new HospitalInfoService();
  private multilingualResponseService = new MultilingualResponseService();
  private loggingService = new LoggingService();

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return this.departmentService.getDepartments();
  }

  async getDepartmentByName(name: string): Promise<Department | null> {
    return this.departmentService.getDepartmentByName(name);
  }

  // Doctor methods
  async getDoctors(): Promise<Doctor[]> {
    return this.doctorService.getDoctors();
  }

  async getDoctorsByDepartment(departmentName: string): Promise<Doctor[]> {
    return this.doctorService.getDoctorsByDepartment(departmentName);
  }

  // Hospital info methods
  async getHospitalInfo(): Promise<HospitalInfo[]> {
    return this.hospitalInfoService.getHospitalInfo();
  }

  async searchHospitalInfo(query: string): Promise<HospitalInfo[]> {
    return this.hospitalInfoService.searchHospitalInfo(query);
  }

  getLocalizedHospitalInfo(info: HospitalInfo, languageCode: string): string {
    return this.hospitalInfoService.getLocalizedHospitalInfo(info, languageCode);
  }

  // Multilingual response methods
  async getMultilingualResponse(intentName: string): Promise<MultilingualResponse | null> {
    return this.multilingualResponseService.getMultilingualResponse(intentName);
  }

  formatTemplateResponse(template: MultilingualResponse, languageCode: string, params: Record<string, any>): string {
    return this.multilingualResponseService.formatTemplateResponse(template, languageCode, params);
  }

  // Logging methods
  async logKioskInteraction(interaction: {
    sessionId: string;
    userQuery: string;
    languageDetected: string;
    intentRecognized: string;
    entities: any;
    systemResponse: string;
    confidenceScore: number;
    responseTimeMs: number;
  }) {
    return this.loggingService.logKioskInteraction(interaction);
  }

  async createOrUpdateKioskSession(sessionId: string, languageCode: string) {
    return this.loggingService.createOrUpdateKioskSession(sessionId, languageCode);
  }
}

export const hospitalDataService = new HospitalDataService();

// Export types for backward compatibility
export type { Department, Doctor, HospitalInfo, MultilingualResponse };
