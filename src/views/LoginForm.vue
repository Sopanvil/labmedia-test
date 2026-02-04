<!-- src/views/LoginForm.vue -->
<script setup lang="ts">
import { useApi } from '@/composables/useApi';
import { useForm, useField } from 'vee-validate';

// 1. Форма vee-validate
const { handleSubmit, isSubmitting } = useForm({
  initialValues: {
    email: '',
    password: '',
  },
});

// 2. Поля и правила
const {
  value: email,
  errorMessage: emailError,
} = useField<string>('email', (value: string) => {
  if (!value) return 'Email обязателен';
  return /^\S+@\S+\.\S+$/.test(value) ? true : 'Некорректный email';
});

const {
  value: password,
  errorMessage: passwordError,
} = useField<string>('password', (value: string) => {
  if (!value) return 'Пароль обязателен';
  return value.length >= 6 ? true : 'Минимум 6 символов';
});

// 3. Настройка API
const api = useApi<{ token: string }>();

// 4. Обработчик отправки
const onSubmit = handleSubmit(async (values) => {
  await api.execute({
    url: '/auth/login',
    method: 'POST',
    data: {
      email: values.email,
      password: values.password,
    },
  });

  if (api.success && api.data) {
    localStorage.setItem('token', api.data.token);
  }
});
</script>

<template>
  <div class="login-form">
    <h2 class="login-form__title">Вход в аккаунт</h2>
    <p class="login-form__subtitle">Используйте рабочую почту для входа</p>

    <form @submit.prevent="onSubmit" class="login-form__form">
      <!-- Email -->
      <div class="form-group">
        <label class="field-label" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="name@company.com"
          class="field-input"
          :class="{ 'field-input--error': !!emailError }"
        />
        <p v-if="emailError" class="field-error">
          {{ emailError }}
        </p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="field-label" for="password">Пароль</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Минимум 6 символов"
          class="field-input"
          :class="{ 'field-input--error': !!passwordError }"
        />
        <p v-if="passwordError" class="field-error">
          {{ passwordError }}
        </p>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="api.loading || isSubmitting"
        class="login-form__submit"
      >
        {{ api.loading || isSubmitting ? 'Входим...' : 'Войти' }}
      </button>

      <!-- Ошибка API -->
      <p v-if="api.error" class="login-form__api-error">
        {{ (api.error.response?.data as any)?.message || 'Произошла ошибка. Попробуйте позже.' }}
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2.5rem auto;
  padding: 2rem 1.75rem;
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  text-align: left;
}

.login-form__title {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #111827;
}

.login-form__subtitle {
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.login-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  color: #111827;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.field-input::placeholder {
  color: #9ca3af;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
  background-color: #ffffff;
}

.field-input--error {
  border-color: #ef4444;
}

.field-error {
  margin: 0;
  font-size: 0.8rem;
  color: #b91c1c;
}

.login-form__submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.08s ease,
    box-shadow 0.15s ease;
}

.login-form__submit:hover:not(:disabled) {
  background-color: #1d4ed8;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
  transform: translateY(-1px);
}

.login-form__submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.login-form__submit:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.login-form__api-error {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: #b91c1c;
}

@media (max-width: 480px) {
  .login-form {
    margin: 1.5rem 1rem;
    padding: 1.5rem 1.25rem;
  }
}
</style>