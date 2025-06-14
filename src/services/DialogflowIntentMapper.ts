
import { hospitalDataService, type Department, type Doctor, type HospitalInfo } from './hospitalDataService';

export interface DialogflowIntent {
  name: string;
  displayName: string;
  trainingPhrases: string[];
  entities: string[];
  parameters: DialogflowParameter[];
  responses: DialogflowResponse[];
}

export interface DialogflowParameter {
  name: string;
  entityType: string;
  isList: boolean;
  required: boolean;
  prompts: string[];
}

export interface DialogflowResponse {
  text: string[];
  languageCode: string;
}

export interface DialogflowEntity {
  name: string;
  displayName: string;
  kind: 'KIND_MAP' | 'KIND_LIST';
  entries: DialogflowEntityEntry[];
}

export interface DialogflowEntityEntry {
  value: string;
  synonyms: string[];
}

export class DialogflowIntentMapper {
  async generateIntentsFromDatabase(): Promise<DialogflowIntent[]> {
    const intents: DialogflowIntent[] = [];
    
    // Generate department navigation intents
    const departments = await hospitalDataService.getDepartments();
    intents.push(...this.generateDepartmentIntents(departments));
    
    // Generate doctor appointment intents
    const doctors = await hospitalDataService.getDoctors();
    intents.push(...this.generateAppointmentIntents(doctors));
    
    // Generate hospital info intents
    const hospitalInfo = await hospitalDataService.getHospitalInfo();
    intents.push(...this.generateHospitalInfoIntents(hospitalInfo));
    
    return intents;
  }

  async generateEntitiesFromDatabase(): Promise<DialogflowEntity[]> {
    const entities: DialogflowEntity[] = [];
    
    // Generate department entities
    const departments = await hospitalDataService.getDepartments();
    entities.push(this.generateDepartmentEntity(departments));
    
    // Generate doctor entities
    const doctors = await hospitalDataService.getDoctors();
    entities.push(this.generateDoctorEntity(doctors));
    
    // Generate specialization entities
    entities.push(this.generateSpecializationEntity(doctors));
    
    // Generate time entities
    entities.push(this.generateTimeEntity());
    
    // Generate day entities
    entities.push(this.generateDayEntity());
    
    return entities;
  }

  private generateDepartmentIntents(departments: Department[]): DialogflowIntent[] {
    const intents: DialogflowIntent[] = [];
    
    // Department navigation intent
    intents.push({
      name: 'navigation.department',
      displayName: 'Department Navigation',
      trainingPhrases: [
        'Where is the @department department?',
        'How do I get to @department?',
        'Find @department',
        'Location of @department',
        'Directions to @department',
        'Where can I find @department?',
        'I need to go to @department',
        'Take me to @department'
      ],
      entities: ['department'],
      parameters: [
        {
          name: 'department',
          entityType: '@department',
          isList: false,
          required: true,
          prompts: ['Which department are you looking for?']
        }
      ],
      responses: [
        {
          text: [`The $department department is located on Floor $floor, Room $room_number. $description`],
          languageCode: 'en'
        }
      ]
    });
    
    return intents;
  }

  private generateAppointmentIntents(doctors: Doctor[]): DialogflowIntent[] {
    const intents: DialogflowIntent[] = [];
    
    // Book appointment intent
    intents.push({
      name: 'appointment.book',
      displayName: 'Book Appointment',
      trainingPhrases: [
        'I want to book an appointment',
        'Schedule an appointment with @doctor',
        'Book appointment for @department',
        'I need to see a @specialization',
        'Appointment with @doctor on @day at @time',
        'Can I get an appointment?',
        'Book me with a doctor',
        'Schedule appointment for @day'
      ],
      entities: ['doctor', 'department', 'specialization', 'day', 'time'],
      parameters: [
        {
          name: 'doctor',
          entityType: '@doctor',
          isList: false,
          required: false,
          prompts: ['Which doctor would you like to see?']
        },
        {
          name: 'department',
          entityType: '@department',
          isList: false,
          required: false,
          prompts: ['Which department?']
        },
        {
          name: 'specialization',
          entityType: '@specialization',
          isList: false,
          required: false,
          prompts: ['What type of specialist do you need?']
        },
        {
          name: 'day',
          entityType: '@day',
          isList: false,
          required: false,
          prompts: ['Which day?']
        },
        {
          name: 'time',
          entityType: '@time',
          isList: false,
          required: false,
          prompts: ['What time?']
        }
      ],
      responses: [
        {
          text: [`I can help you book an appointment. Let me find available doctors for you.`],
          languageCode: 'en'
        }
      ]
    });
    
    return intents;
  }

  private generateHospitalInfoIntents(hospitalInfo: HospitalInfo[]): DialogflowIntent[] {
    const intents: DialogflowIntent[] = [];
    
    // Hospital information intent
    intents.push({
      name: 'hospital.info',
      displayName: 'Hospital Information',
      trainingPhrases: [
        'What are the visiting hours?',
        'How can I pay?',
        'Where is the parking?',
        'Do you have WiFi?',
        'Where is the canteen?',
        'What documents do I need?',
        'How do I get here by bus?',
        'Is wheelchair access available?'
      ],
      entities: [],
      parameters: [],
      responses: [
        {
          text: ['Let me help you with hospital information.'],
          languageCode: 'en'
        }
      ]
    });
    
    return intents;
  }

  private generateDepartmentEntity(departments: Department[]): DialogflowEntity {
    return {
      name: 'department',
      displayName: 'Department',
      kind: 'KIND_MAP',
      entries: departments.map(dept => ({
        value: dept.name.toLowerCase(),
        synonyms: [
          dept.name,
          dept.name.toLowerCase(),
          dept.name.toUpperCase(),
          ...this.generateDepartmentSynonyms(dept.name)
        ]
      }))
    };
  }

  private generateDoctorEntity(doctors: Doctor[]): DialogflowEntity {
    return {
      name: 'doctor',
      displayName: 'Doctor',
      kind: 'KIND_MAP',
      entries: doctors.map(doctor => ({
        value: doctor.name.toLowerCase(),
        synonyms: [
          doctor.name,
          `Dr. ${doctor.name}`,
          `Doctor ${doctor.name}`,
          doctor.name.toLowerCase()
        ]
      }))
    };
  }

  private generateSpecializationEntity(doctors: Doctor[]): DialogflowEntity {
    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];
    
    return {
      name: 'specialization',
      displayName: 'Medical Specialization',
      kind: 'KIND_MAP',
      entries: specializations.map(spec => ({
        value: spec.toLowerCase(),
        synonyms: [
          spec,
          spec.toLowerCase(),
          ...this.generateSpecializationSynonyms(spec)
        ]
      }))
    };
  }

  private generateTimeEntity(): DialogflowEntity {
    const timeSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
    ];
    
    return {
      name: 'time',
      displayName: 'Appointment Time',
      kind: 'KIND_MAP',
      entries: timeSlots.map(time => ({
        value: time,
        synonyms: [time, time.replace(' ', ''), time.toLowerCase()]
      }))
    };
  }

  private generateDayEntity(): DialogflowEntity {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return {
      name: 'day',
      displayName: 'Day of Week',
      kind: 'KIND_MAP',
      entries: days.map(day => ({
        value: day.toLowerCase(),
        synonyms: [day, day.toLowerCase(), day.substring(0, 3), day.substring(0, 3).toLowerCase()]
      }))
    };
  }

  private generateDepartmentSynonyms(departmentName: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'Cardiology': ['heart', 'cardiac', 'cardiovascular', 'heart department'],
      'Emergency': ['ER', 'emergency room', 'urgent care', 'trauma'],
      'Radiology': ['x-ray', 'imaging', 'scan', 'CT', 'MRI'],
      'Pediatrics': ['children', 'kids', 'child care', 'baby'],
      'Neurology': ['brain', 'neuro', 'nervous system'],
      'Orthopedics': ['bone', 'joints', 'fracture', 'orthopedic'],
      'Gynecology': ['women', 'female', 'gynae', 'obstetrics'],
      'Ophthalmology': ['eye', 'vision', 'eye care'],
      'ENT': ['ear nose throat', 'ENT', 'otolaryngology'],
      'Dermatology': ['skin', 'derma', 'skin care'],
      'Psychiatry': ['mental health', 'psychology', 'counseling'],
      'Pharmacy': ['medicine', 'drugs', 'prescription', 'chemist']
    };
    
    return synonymMap[departmentName] || [];
  }

  private generateSpecializationSynonyms(specialization: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'Cardiologist': ['heart doctor', 'heart specialist', 'cardiac doctor'],
      'Neurologist': ['brain doctor', 'neuro doctor', 'nervous system doctor'],
      'Orthopedic': ['bone doctor', 'joint specialist', 'fracture doctor'],
      'Pediatrician': ['child doctor', 'kids doctor', 'baby doctor'],
      'Gynecologist': ['women doctor', 'lady doctor', 'female specialist'],
      'Dermatologist': ['skin doctor', 'skin specialist'],
      'Psychiatrist': ['mental health doctor', 'counselor', 'therapist'],
      'Ophthalmologist': ['eye doctor', 'vision specialist']
    };
    
    return synonymMap[specialization] || [];
  }
}

export const dialogflowIntentMapper = new DialogflowIntentMapper();
