import { renderHook, act } from '@testing-library/react';
import { useApi } from '../../../shared/hooks/useApi';

describe('useApi', () => {
  it('deve inicializar com estado padrão', () => {
    const mockApiFunction = jest.fn();
    const { result } = renderHook(() => useApi(mockApiFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('deve executar função API com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useApi(mockApiFunction));

    let executeResult;
    await act(async () => {
      executeResult = await result.current.execute('arg1', 'arg2');
    });

    expect(mockApiFunction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(executeResult).toBe(mockData);
    expect(result.current.data).toBe(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve definir loading como true durante execução', async () => {
    const mockApiFunction = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('data'), 100))
    );
    const { result } = renderHook(() => useApi(mockApiFunction));

    // Iniciar execução
    act(() => {
      result.current.execute();
    });

    // Verificar que loading é true imediatamente após iniciar
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('deve lidar com erro da API', async () => {
    const mockError = new Error('API Error');
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Esperado que lance erro
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API Error');
  });

  it('deve lidar com erro com response.data.message', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Custom error message'
        }
      }
    };
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Esperado que lance erro
      }
    });

    expect(result.current.error).toBe('Custom error message');
  });

  it('deve usar mensagem padrão quando não há mensagem específica', async () => {
    const mockError = {
      response: {
        data: {}
      }
    };
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Esperado que lance erro
      }
    });

    expect(result.current.error).toBe('Erro desconhecido');
  });

  it('deve resetar estado corretamente', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useApi(mockApiFunction));

    // Primeiro executa com sucesso
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe(mockData);

    // Depois reseta
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve limpar erro anterior ao executar nova requisição', async () => {
    const mockError = new Error('First error');
    const mockApiFunction = jest.fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useApi(mockApiFunction));

    // Primeira execução com erro
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Esperado que lance erro
      }
    });

    expect(result.current.error).toBe('First error');

    // Segunda execução com sucesso
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ success: true });
    expect(result.current.error).toBeNull();
  });

  it('deve manter referência estável das funções', () => {
    const mockApiFunction = jest.fn();
    const { result, rerender } = renderHook(() => useApi(mockApiFunction));

    const firstExecute = result.current.execute;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.execute).toBe(firstExecute);
    expect(result.current.reset).toBe(firstReset);
  });

  it('deve funcionar com diferentes tipos de dados', async () => {
    const stringData = 'test string';
    const numberData = 42;
    const objectData = { key: 'value' };
    const arrayData = [1, 2, 3];

    const { result: stringResult } = renderHook(() => useApi(() => Promise.resolve(stringData)));
    const { result: numberResult } = renderHook(() => useApi(() => Promise.resolve(numberData)));
    const { result: objectResult } = renderHook(() => useApi(() => Promise.resolve(objectData)));
    const { result: arrayResult } = renderHook(() => useApi(() => Promise.resolve(arrayData)));

    await act(async () => {
      await stringResult.current.execute();
      await numberResult.current.execute();
      await objectResult.current.execute();
      await arrayResult.current.execute();
    });

    expect(stringResult.current.data).toBe(stringData);
    expect(numberResult.current.data).toBe(numberData);
    expect(objectResult.current.data).toBe(objectData);
    expect(arrayResult.current.data).toBe(arrayData);
  });
});