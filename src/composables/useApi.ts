import { reactive, readonly, type UnwrapRef } from 'vue';
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type CancelTokenSource,
} from 'axios';

// Расширяем конфиг, чтобы явно указывать URL и метод
export interface UseApiRequestConfig extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface UseApiState<T = unknown> {
  data: T | null;
  error: AxiosError | null;
  loading: boolean;
  success: boolean;
}

export function useApi<T = unknown>() {
  // Состояние запроса
  const state = reactive<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
    success: false,
  });

  // Источник отмены (для предотвращения утечек при быстрой смене состояний)
  let cancelSource: CancelTokenSource | null = null;

  /**
   * Выполнение запроса
   */
  const execute = async (config: UseApiRequestConfig): Promise<AxiosResponse<T> | null> => {
    // Отмена предыдущего запроса
    if (cancelSource) {
      cancelSource.cancel('Request superseded by a new one.');
    }

    // Создаём новый токен отмены
    cancelSource = axios.CancelToken.source();

    // Сброс состояния
    state.data = null;
    state.error = null;
    state.loading = true;
    state.success = false;

    try {
      const response = await axios.request<T>({
        ...config,
        cancelToken: cancelSource.token,
      });

      state.data = response.data as UnwrapRef<T>;
      state.success = true;
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axios.isCancel(axiosError)) {
        console.debug('Request was canceled:', axiosError.message);
      } else {
        state.error = axiosError;
      }
      return null;
    } finally {
      state.loading = false;
    }
  };

  /**
   * Сброс состояния
   */
  const reset = () => {
    state.data = null;
    state.error = null;
    state.loading = false;
    state.success = false;
  };

  // Возвращаем только readonly-версию состояния (защита от мутаций извне)
  return {
    ...readonly(state),
    execute,
    reset,
  };
}

