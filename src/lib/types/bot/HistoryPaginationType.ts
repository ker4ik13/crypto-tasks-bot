export interface HistoryPaginationType<T> {
  pageItems: T[];
  pages: number;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
