import { reactive, computed } from 'vue';

// Типы для правил
export type ValidationRule = (value: any) => boolean | string;
export interface ValidationRules {
  [key: string]: ValidationRule[];
}

// Состояние одного поля
export interface FieldState {
  value: any;
  isValid: boolean;
  errors: string[];
}

// Состояние всей формы
export interface FormState {
  [key: string]: FieldState;
}

// Входные данные
export interface UseValidationOptions {
  initialValues: Record<string, any>;
  rules: ValidationRules;
}

export function useValidation(options: UseValidationOptions) {
  const { initialValues, rules } = options;

  // Инициализация состояния формы
  const formState = reactive<FormState>({});

  // Инициализируем каждое поле
  for (const key in initialValues) {
    formState[key] = {
      value: initialValues[key],
      isValid: true,
      errors: [],
    };
  }

  // Функция валидации одного поля
  const validateField = (fieldName: string): boolean => {
    const field = formState[fieldName];
    if (!field) return false;

    const fieldValue = field.value;
    const fieldRules = rules[fieldName] || [];

    const errors: string[] = [];

    for (const rule of fieldRules) {
      const result = rule(fieldValue);
      if (typeof result === 'string') {
        errors.push(result);
      } else if (result === false) {
        errors.push(`${fieldName} is invalid`);
      }
    }

    field.errors = errors;
    field.isValid = errors.length === 0;

    return field.isValid;
  };

  // Валидация всей формы
  const validateForm = (): boolean => {
    let isFormValid = true;
    for (const fieldName in formState) {
      const isFieldValid = validateField(fieldName);
      if (!isFieldValid) isFormValid = false;
    }
    return isFormValid;
  };

  // Обновление значения поля
  const setFieldValue = (fieldName: string, value: any): void => {
    if (formState[fieldName]) {
      formState[fieldName].value = value;
      // При необходимости можно сразу валидировать поле:
      // validateField(fieldName);
    }
  };

  // Вычисляемые свойства
  const isFormValid = computed(() => {
    return Object.values(formState).every((field) => field.isValid);
  });

  const hasErrors = computed(() => !isFormValid.value);

  return {
    formState,
    isFormValid,
    hasErrors,
    validateField,
    validateForm,
    setFieldValue,
  };
}

