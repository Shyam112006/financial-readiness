export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC 5322 simplified email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim());
}

export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

export function isValidAge(age: unknown): boolean {
  if (age === undefined || age === null || age === '') return false;
  const num = typeof age === 'number' ? age : parseInt(String(age), 10);
  return !isNaN(num) && Number.isInteger(num) && num >= 10 && num <= 120;
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSurveySubmission(data: unknown): {
  valid: boolean;
  errors: Record<string, string>;
  data?: {
    respondent: { name: string; email: string; age: number };
    answers: Record<string, string>;
  };
} {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Invalid submission payload' } };
  }

  const payload = data as {
    respondent?: { name?: string; email?: string; age?: unknown };
    answers?: Record<string, string>;
  };

  if (!payload.respondent || typeof payload.respondent !== 'object') {
    errors['respondent'] = 'Respondent details are required';
  } else {
    const { name, email, age } = payload.respondent;
    if (!name || !isValidName(name)) {
      errors['respondent.name'] = 'Full Name is required (at least 2 characters)';
    }
    if (!email || !isValidEmail(email)) {
      errors['respondent.email'] = 'A valid email address is required';
    }
    if (!isValidAge(age)) {
      errors['respondent.age'] = 'Please enter a valid age (10 to 120)';
    }
  }

  if (!payload.answers || typeof payload.answers !== 'object' || Object.keys(payload.answers).length === 0) {
    errors['answers'] = 'Survey answers are required';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const ageNum = typeof payload.respondent!.age === 'number'
    ? payload.respondent!.age
    : parseInt(String(payload.respondent!.age), 10);

  return {
    valid: true,
    errors: {},
    data: {
      respondent: {
        name: sanitizeInput(payload.respondent!.name!),
        email: payload.respondent!.email!.trim().toLowerCase(),
        age: ageNum,
      },
      answers: payload.answers!,
    },
  };
}
