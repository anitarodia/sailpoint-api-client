import type { AxiosResponse } from "axios";
import {
  Search,
  SearchApi,
  SearchApiSearchPostRequest,
  SearchDocument,
} from "./v3";

export interface PaginationParams {
  limit?: number;
  offset?: number;
  count?: boolean;
  filters?: string;
}

export interface ExtraParams {
  [key: string]: any;
}

export class Paginator {
  public static async paginate<
    T,
    TResult,
    A extends PaginationParams & ExtraParams
  >(
    thisArg: T,
    callbackFn: (this: T, args: A) => Promise<AxiosResponse<TResult[], any>>,
    args?: A,
    increment?: number,
    concurrency?: number // Added concurrency support
  ): Promise<AxiosResponse<TResult[], any>> {
    let params: PaginationParams = args ? args : { limit: 0, offset: 0 };
    const maxLimit = params && params.limit ? params.limit : 0;
    if (!params.offset) {
      params.offset = 0;
    }
    if (!increment) {
      increment = 250;
    }
    if (!concurrency) {
      concurrency = 1; // Default to 1 request at a time if concurrency is not provided
    }
    params.limit = increment;

    let modified: TResult[] = [];
    const requests = [];

    while (true) {
      console.log(`Paginating call, offset = ${params.offset}`);
      const request = callbackFn.call(thisArg, params).then((results: AxiosResponse<TResult[], any>) => {
        modified.push(...results.data);
        return results.data.length < increment || (modified.length >= maxLimit && maxLimit > 0);
      });
      requests.push(request);

      if (requests.length === concurrency) {
        const responses = await Promise.all(requests);
        if (responses.some(isDone => isDone)) {
          return {
            ...await callbackFn.call(thisArg, params),
            data: modified,
          };
        }
        requests.length = 0; // Clear the batch of requests
      }
      params.offset += increment;
    }
  }

  public static async paginateSearchApi(
    searchAPI: SearchApi,
    search: Search,
    increment?: number,
    limit?: number,
    concurrency?: number // Added concurrency support
  ): Promise<AxiosResponse<SearchDocument[], any>> {
    increment = increment ? increment : 250;
    const searchParams: SearchApiSearchPostRequest = {
      search: search,
      limit: increment,
    };
    let offset = 0;
    const maxLimit = limit ? limit : 0;
    let modified: SearchDocument[] = [];
    const requests = [];

    if (!search.sort || search.sort.length != 1) {
      throw new Error("Search must include exactly one sort parameter to paginate properly");
    }
    if (!concurrency) {
      concurrency = 1; // Default to 1 request at a time if concurrency is not provided
    }

    while (true) {
      console.log(`Paginating call, offset = ${offset}`);
      const request = searchAPI.searchPost(searchParams).then((results: AxiosResponse<SearchDocument[], any>) => {
        modified.push(...results.data);
        if (results.data.length < increment || (modified.length >= maxLimit && maxLimit > 0)) {
          return { done: true, data: modified };
        }
        const lastResult = results.data[results.data.length - 1] as any;
        if (searchParams.search.sort) {
          searchParams.search.searchAfter = [
            lastResult[searchParams.search.sort[0].replace("-", "")],
          ];
        } else {
          throw new Error("Search unexpectedly did not return a result we can search after!");
        }
        return { done: false, data: results.data };
      });

      requests.push(request);

      if (requests.length === concurrency) {
        const responses = await Promise.all(requests);
        const anyDone = responses.some((response) => response.done);
        if (anyDone) {
          return {
            ...await searchAPI.searchPost(searchParams),
            data: modified,
          };
        }
        requests.length = 0; // Clear the batch of requests
      }
      offset += increment;
    }
  }
}
