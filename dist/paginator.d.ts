import type { AxiosResponse } from "axios";
import { Search, SearchApi, SearchDocument } from "./v3";
export interface PaginationParams {
    limit?: number;
    offset?: number;
    count?: boolean;
    filters?: string;
}
export interface ExtraParams {
    [key: string]: any;
}
export declare class Paginator {
    static paginate<T, TResult, A extends PaginationParams & ExtraParams>(thisArg: T, callbackFn: (this: T, args: A) => Promise<AxiosResponse<TResult[], any>>, args?: A, increment?: number, concurrency?: number): Promise<AxiosResponse<TResult[], any>>;
    static paginateSearchApi(searchAPI: SearchApi, search: Search, increment?: number, limit?: number, concurrency?: number): Promise<AxiosResponse<SearchDocument[], any>>;
}
