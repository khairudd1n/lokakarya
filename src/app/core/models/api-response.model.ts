export interface ApiResponse<T> {
    info: {
        status: number;
        message: string;
        detailMessage: string;
        executionTime: string;
        detailInfo: string;
      };
      total_rows: number;
      content: T;
}
