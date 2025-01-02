export interface ApiResponse<T> {
  info: {
    status: number;
    message: string;
    detailMessage: string;
    executionTime: string;
    detailInfo: string;
  };
  page_info: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
  }
  total_rows: number;
  content: T;
}
