
import { dialogflowIntentMapper } from './DialogflowIntentMapper';
import { hospitalDataService } from './hospitalDataService';

export interface IntentEntityMapping {
  intentName: string;
  entities: EntityMapping[];
  databaseQuery: DatabaseQueryConfig;
  responseTemplate: ResponseTemplate;
}

export interface EntityMapping {
  entityName: string;
  databaseField: string;
  matchingStrategy: 'exact' | 'partial' | 'synonyms';
}

export interface DatabaseQueryConfig {
  table: string;
  joinTables?: JoinConfig[];
  conditions: QueryCondition[];
  orderBy?: string;
  limit?: number;
}

export interface JoinConfig {
  table: string;
  on: string;
  type: 'inner' | 'left' | 'right';
}

export interface QueryCondition {
  field: string;
  operator: 'equals' | 'like' | 'in' | 'contains';
  value: string | string[];
  entitySource?: string;
}

export interface ResponseTemplate {
  success: string;
  notFound: string;
  multipleResults: string;
  error: string;
  languageVariants?: Record<string, Partial<ResponseTemplate>>;
}

export class DialogflowAutomationService {
  private intentEntityMappings: IntentEntityMapping[] = [
    {
      intentName: 'navigation.department',
      entities: [
        {
          entityName: 'department',
          databaseField: 'name',
          matchingStrategy: 'partial'
        }
      ],
      databaseQuery: {
        table: 'departments',
        conditions: [
          {
            field: 'name',
            operator: 'like',
            value: '%{department}%',
            entitySource: 'department'
          }
        ],
        limit: 1
      },
      responseTemplate: {
        success: 'The {department_name} department is located on Floor {floor}, Room {room_number}. {description}',
        notFound: 'I could not find the {department} department. Please check the spelling or ask about another department.',
        multipleResults: 'I found multiple departments matching {department}. Could you be more specific?',
        error: 'I am having trouble accessing department information right now.',
        languageVariants: {
          'ta-IN': {
            success: '{department_name} பிரிவு {floor}-ம் மாடி, அறை {room_number}-ல் உள்ளது। {description}',
            notFound: '{department} பிரிவை என்னால் கண்டுபிடிக்க முடியவில்லை।'
          },
          'ml-IN': {
            success: '{department_name} വിഭാഗം {floor}-ാം നിലയിൽ, റൂം {room_number}-ൽ സ്ഥിതി ചെയ്യുന്നു। {description}',
            notFound: '{department} വിഭാഗം കണ്ടെത്താൻ കഴിഞ്ഞില്ല।'
          }
        }
      }
    },
    {
      intentName: 'appointment.book',
      entities: [
        {
          entityName: 'department',
          databaseField: 'departments.name',
          matchingStrategy: 'partial'
        },
        {
          entityName: 'specialization',
          databaseField: 'specialization',
          matchingStrategy: 'partial'
        },
        {
          entityName: 'doctor',
          databaseField: 'name',
          matchingStrategy: 'partial'
        }
      ],
      databaseQuery: {
        table: 'doctors',
        joinTables: [
          {
            table: 'departments',
            on: 'doctors.department_id = departments.id',
            type: 'inner'
          }
        ],
        conditions: [],
        orderBy: 'doctors.name',
        limit: 3
      },
      responseTemplate: {
        success: 'I found Dr. {doctor_name} from {department_name}. Available on {available_days}. Consultation fee: ₹{consultation_fee}. Would you like to book an appointment?',
        notFound: 'I could not find any doctors matching your criteria. Please try a different department or specialization.',
        multipleResults: 'I found {count} doctors matching your criteria. Here are the available options: {doctor_list}',
        error: 'I am having trouble accessing doctor information right now.'
      }
    },
    {
      intentName: 'hospital.info',
      entities: [],
      databaseQuery: {
        table: 'hospital_info',
        conditions: [],
        orderBy: 'category'
      },
      responseTemplate: {
        success: '{answer}',
        notFound: 'I do not have specific information about that. You can ask me about visiting hours, Wi-Fi, canteen, wheelchair access, payment options, or transportation.',
        multipleResults: 'Here is the information you requested: {info_list}',
        error: 'I am having trouble accessing hospital information right now.'
      }
    }
  ];

  async processDialogflowRequest(
    intentName: string,
    entities: Record<string, any>,
    languageCode: string = 'en-US'
  ): Promise<{
    responseText: string;
    responseData: any;
    confidence: number;
  }> {
    console.log('🤖 Processing Dialogflow request:', { intentName, entities, languageCode });

    const mapping = this.intentEntityMappings.find(m => m.intentName === intentName);
    if (!mapping) {
      return {
        responseText: 'I am not sure how to handle that request.',
        responseData: { error: 'No mapping found for intent' },
        confidence: 0.1
      };
    }

    try {
      const queryResult = await this.executeQuery(mapping, entities);
      const responseText = this.generateResponse(mapping, queryResult, entities, languageCode);
      
      return {
        responseText,
        responseData: {
          queryResult,
          mappingUsed: mapping.intentName,
          entitiesProcessed: entities
        },
        confidence: queryResult.success ? 0.9 : 0.3
      };
    } catch (error) {
      console.error('❌ Error processing Dialogflow request:', error);
      return {
        responseText: this.getErrorResponse(mapping, languageCode),
        responseData: { error: error.message },
        confidence: 0.1
      };
    }
  }

  private async executeQuery(
    mapping: IntentEntityMapping,
    entities: Record<string, any>
  ): Promise<{
    data: any[];
    success: boolean;
    matchedEntities: Record<string, any>;
  }> {
    const { databaseQuery } = mapping;
    
    // Build dynamic conditions based on entities
    const conditions = [...databaseQuery.conditions];
    const matchedEntities: Record<string, any> = {};

    // Add entity-based conditions
    for (const entityMapping of mapping.entities) {
      const entityValue = entities[entityMapping.entityName];
      if (entityValue) {
        matchedEntities[entityMapping.entityName] = entityValue;
        
        // Replace placeholder in existing conditions
        conditions.forEach(condition => {
          if (condition.entitySource === entityMapping.entityName) {
            condition.value = condition.value.toString().replace(`{${entityMapping.entityName}}`, entityValue);
          }
        });
      }
    }

    console.log('📊 Executing query for table:', databaseQuery.table, 'with conditions:', conditions);

    // Execute query based on table
    let data: any[] = [];
    
    switch (databaseQuery.table) {
      case 'departments':
        if (conditions.length > 0) {
          const departmentName = matchedEntities.department;
          if (departmentName) {
            const department = await hospitalDataService.getDepartmentByName(departmentName);
            data = department ? [department] : [];
          }
        } else {
          data = await hospitalDataService.getDepartments();
        }
        break;

      case 'doctors':
        if (matchedEntities.department) {
          data = await hospitalDataService.getDoctorsByDepartment(matchedEntities.department);
        } else {
          data = await hospitalDataService.getDoctors();
        }
        
        // Filter by specialization if provided
        if (matchedEntities.specialization) {
          data = data.filter(doctor => 
            doctor.specialization?.toLowerCase().includes(matchedEntities.specialization.toLowerCase())
          );
        }
        
        // Filter by doctor name if provided
        if (matchedEntities.doctor) {
          data = data.filter(doctor => 
            doctor.name.toLowerCase().includes(matchedEntities.doctor.toLowerCase())
          );
        }
        
        if (databaseQuery.limit) {
          data = data.slice(0, databaseQuery.limit);
        }
        break;

      case 'hospital_info':
        const allInfo = await hospitalDataService.getHospitalInfo();
        
        // Simple keyword matching for hospital info
        const query = Object.values(matchedEntities).join(' ').toLowerCase();
        if (query) {
          data = await hospitalDataService.searchHospitalInfo(query);
        } else {
          data = allInfo;
        }
        break;

      default:
        console.warn('⚠️ Unknown table:', databaseQuery.table);
        data = [];
    }

    return {
      data,
      success: data.length > 0,
      matchedEntities
    };
  }

  private generateResponse(
    mapping: IntentEntityMapping,
    queryResult: any,
    entities: Record<string, any>,
    languageCode: string
  ): string {
    const { responseTemplate } = mapping;
    const { data, success, matchedEntities } = queryResult;

    // Get language-specific template if available
    const langTemplate = responseTemplate.languageVariants?.[languageCode];
    const template = { ...responseTemplate, ...langTemplate };

    if (!success || data.length === 0) {
      return this.interpolateTemplate(template.notFound, { ...matchedEntities, ...entities });
    }

    if (data.length === 1) {
      const item = data[0];
      return this.interpolateTemplate(template.success, { 
        ...matchedEntities, 
        ...entities, 
        ...this.flattenObject(item) 
      });
    }

    // Multiple results
    const listItems = data.map(item => this.formatListItem(item, mapping.intentName)).join(', ');
    return this.interpolateTemplate(template.multipleResults, {
      ...matchedEntities,
      ...entities,
      count: data.length,
      [`${mapping.databaseQuery.table.slice(0, -1)}_list`]: listItems
    });
  }

  private interpolateTemplate(template: string, values: Record<string, any>): string {
    let result = template;
    
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    return result;
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join(', ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  private formatListItem(item: any, intentName: string): string {
    switch (intentName) {
      case 'navigation.department':
        return `${item.name} (Floor ${item.floor})`;
      case 'appointment.book':
        return `Dr. ${item.name} - ${item.specialization}`;
      case 'hospital.info':
        return item.question;
      default:
        return item.name || item.title || String(item);
    }
  }

  private getErrorResponse(mapping: IntentEntityMapping, languageCode: string): string {
    const template = mapping.responseTemplate.languageVariants?.[languageCode] || mapping.responseTemplate;
    return template.error;
  }

  async generateTrainingData(): Promise<{
    intents: any[];
    entities: any[];
    trainingPhrases: string[];
  }> {
    console.log('🎯 Generating training data from database...');
    
    const intents = await dialogflowIntentMapper.generateIntentsFromDatabase();
    const entities = await dialogflowIntentMapper.generateEntitiesFromDatabase();
    
    // Extract all training phrases for analysis
    const trainingPhrases = intents.flatMap(intent => intent.trainingPhrases);
    
    console.log(`✅ Generated ${intents.length} intents, ${entities.length} entities, ${trainingPhrases.length} training phrases`);
    
    return {
      intents,
      entities,
      trainingPhrases
    };
  }
}

export const dialogflowAutomationService = new DialogflowAutomationService();
