import { api } from './api';
import { CreateReportDto, PagedReportResult, ReportDetailsDto, ReportStatus } from '../types/reports.types';

export const submitReport = async (data: CreateReportDto): Promise<void> => {
  await api.post('/reports', data);
};

export const getReports = async (
  page: number = 1,
  pageSize: number = 10,
  status?: ReportStatus,
  targetType?: string
): Promise<PagedReportResult> => {
  const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
  if (status) params.append('status', status);
  if (targetType) params.append('targetType', targetType);

  const response = await api.get('/admin/reports', { params });
  return response.data;
};

export const getReportDetails = async (reportId: string): Promise<ReportDetailsDto> => {
  const response = await api.get(`/admin/reports/${reportId}`);
  return response.data;
};

export const updateReportStatus = async (
  reportId: string,
  status: ReportStatus,
  adminNotes?: string
): Promise<void> => {
  await api.patch(`/admin/reports/${reportId}/status`, { status, adminNotes });
};
