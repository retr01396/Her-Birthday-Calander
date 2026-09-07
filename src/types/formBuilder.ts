/**
 * Dynamic Form Builder Type Definitions
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'image';

export interface FormFieldSchema {
  id: string;              // Unique field identifier (e.g., "field_171829102")
  type: FieldType;
  label: string;           // Question label (e.g., "T-Shirt Size")
  placeholder?: string;    // Input placeholder text
  helpText?: string;       // Helper/description text below input
  options?: string[];      // Choices for radio, checkbox, select
  isRequired: boolean;     // Whether field is mandatory
}

export interface FormResponsesPayload {
  [fieldId: string]: string | string[];
}

export interface EventWithFormSchema {
  id: string;
  title: string;
  slug?: string | null;
  description: string;
  location: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  capacity: number;
  formSchema?: FormFieldSchema[] | null;
  club: {
    id: string;
    name: string;
    slug?: string | null;
  };
  _count?: {
    registrations: number;
  };
}

export interface StudentRegistrationResponse {
  id: string;
  userId: string;
  eventId: string;
  formResponses: FormResponsesPayload;
  attended: boolean;
  registeredAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    yearOfStudy?: string | null;
    division?: string | null;
  };
}
