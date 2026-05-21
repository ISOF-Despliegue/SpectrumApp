export type TargetType = 'USER' | 'REVIEW' | 'COMMENT' | 'GAME_CLIP';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface CreateReportDto {
  targetId: string;
  targetType: TargetType;
  reason: string;
  description?: string;
}

export interface ReportSummaryDto {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: TargetType;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface ReportDetailsDto extends ReportSummaryDto {
  reporterUsername: string;
  targetContentSnippet?: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface PagedReportResult {
  items: ReportSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
