import { useState, useCallback } from 'react';
import { apiClient, QueryParams } from '../services/api';
import toast from 'react-hot-toast';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic API hook
export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Organisation hooks
export function useOrganisations() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchOrganisations = useCallback(async (params?: QueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.getOrganisations(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organisations';
      setState({ data: null, loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createOrganisation = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.createOrganisation(data);
      toast.success('Organisation created successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organisation';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateOrganisation = useCallback(async (id: number, data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.updateOrganisation(id, data);
      toast.success('Organisation updated successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organisation';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const deleteOrganisation = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.deleteOrganisation(id);
      toast.success('Organisation deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete organisation';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchOrganisations,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
  };
}

// Employee hooks
export function useEmployees() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchEmployees = useCallback(async (params?: QueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.getEmployees(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
      setState({ data: null, loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createEmployee = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.createEmployee(data);
      toast.success('Employee created successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create employee';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateEmployee = useCallback(async (id: number, data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.updateEmployee(id, data);
      toast.success('Employee updated successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const deleteEmployee = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.deleteEmployee(id);
      toast.success('Employee deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

// Attendance hooks
export function useAttendance() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchAttendance = useCallback(async (params?: QueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.getAttendance(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance';
      setState({ data: null, loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createAttendance = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.createAttendance(data);
      toast.success('Attendance record created successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create attendance record';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateAttendance = useCallback(async (id: number, data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.updateAttendance(id, data);
      toast.success('Attendance record updated successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update attendance record';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const deleteAttendance = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.deleteAttendance(id);
      toast.success('Attendance record deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete attendance record';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
}

// Salary hooks
export function useSalary() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchSalaryIncrements = useCallback(async (params?: QueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.getSalaryIncrements(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch salary increments';
      setState({ data: null, loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createSalaryIncrement = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.createSalaryIncrement(data);
      toast.success('Salary increment created successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create salary increment';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateSalaryIncrement = useCallback(async (id: number, data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiClient.updateSalaryIncrement(id, data);
      toast.success('Salary increment updated successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update salary increment';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const deleteSalaryIncrement = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiClient.deleteSalaryIncrement(id);
      toast.success('Salary increment deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete salary increment';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchSalaryIncrements,
    createSalaryIncrement,
    updateSalaryIncrement,
    deleteSalaryIncrement,
  };
} 