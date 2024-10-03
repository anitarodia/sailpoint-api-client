import type { AxiosResponse } from "axios";
import {
  Search,
  SearchApi,
  SearchApiSearchPostRequest,
  SearchDocument,
} from "./v3";

export interface PaginationParams {
  /**
   * Max number of results to return. See [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.
   * @type {number}
   * @memberof AccountsApiListAccounts
   */
  limit?: number;
  /**
   * Offset into the full result set. Usually specified with *limit* to paginate through the results. See [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.
   * @type {number}
   * @memberof AccountsApiListAccounts
   */
  offset?: number;
  /**
   * If *true* it will populate the *X-Total-Count* response header with the number of results that would be returned if *limit* and *offset* were ignored.  Since requesting a total count can have a performance impact, it is recommended not to send **count&#x3D;true** if that value will not be used.  See [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.
   * @type {boolean}
   * @memberof AccountsApiListAccounts
   */
  count?: boolean;
  /**
   * Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)  Filtering is supported for the following fields and operators:  **id**: *eq, in*  **identityId**: *eq*  **name**: *eq, in*  **nativeIdentity**: *eq, in*  **sourceId**: *eq, in*  **uncorrelated**: *eq*
   * @type {string}
   * @memberof AccountsApiListAccounts
   */
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
    increment?: number  // Make increment optional
  ): Promise<AxiosResponse<TResult[], any>> {
    let params: PaginationParams = args ? args : { limit: 0, offset: 0 };
    const maxLimit = params && params.limit ? params.limit : 0;

    // Set default values for increment and offset
    if (!params.offset) {
      params.offset = 0;
    }
    if (!increment) {
      increment = 250;
    }
    params.limit = increment;

    let modified: TResult[] = [];
    const concurrencyLimit = 10; // Hardcoded concurrency limit

    // Declare the variable to hold the results
    let resultsArray: AxiosResponse<TResult[], any>[] = [];

    while (true) {
      console.log(`Paginating call, offset = ${params.offset}`);

      // Create an array of promises to fetch multiple pages concurrently
      const promises = [];
      for (let i = 0; i < concurrencyLimit; i++) {
        const offset = params.offset + i * increment!;
        promises.push(callbackFn.call(thisArg, { ...params, offset }));
      }

      // Wait for all the concurrent requests to complete
      resultsArray = await Promise.all(promises);

      // Process each response
      for (const results of resultsArray) {
        modified.push(...results.data);
        
        // If the number of returned records is less than the increment, stop fetching
        if (results.data.length < increment || (maxLimit > 0 && modified.length >= maxLimit)) {
          results.data = modified; // Update data with the modified array
          return results; // Return the last successful response
        }
      }

      // Increment the offset for the next set of parallel requests
      params.offset += increment * concurrencyLimit;

      // If we reach the maxLimit, stop fetching
      if (maxLimit > 0 && modified.length >= maxLimit) {
        break; // Exit the loop if we've reached the maximum limit
      }
    }

    // Return the last response with the combined results
    const finalResponse = resultsArray[0]; // Use the first response for metadata
    finalResponse.data = modified; // Set the combined data
    return finalResponse; // Return the final response
  }

  public static async paginateSearchApi(
    searchAPI: SearchApi,
    search: Search,
    increment?: number,
    limit?: number
  ): Promise<AxiosResponse<SearchDocument[], any>> {
    return this.paginateSearchApiWithConcurrency(searchAPI, search, increment, limit);
  }

  private static async paginateSearchApiWithConcurrency(
    searchAPI: SearchApi,
    search: Search,
    increment?: number,
    limit?: number,
    concurrency: number = 3
  ): Promise<AxiosResponse<SearchDocument[], any>> {
    increment = increment || 250;
    const maxLimit = limit || 0;
    let modified: SearchDocument[] = [];

    if (!search.sort || search.sort.length !== 1) {
      throw new Error("Search must include exactly one sort parameter to paginate properly");
    }

    const fetchPage = async (searchAfter?: any[]): Promise<SearchDocument[]> => {
      const searchParams: SearchApiSearchPostRequest = {
        search: { ...search, searchAfter },
        limit: increment,
      };
      const results = await searchAPI.searchPost(searchParams);
      return results.data;
    };

    let searchAfter: any[] | undefined;
    
    while (true) {
      const pagePromises: Promise<SearchDocument[]>[] = [];

      for (let i = 0; i < concurrency; i++) {
        pagePromises.push(fetchPage(searchAfter));
      }

      const pages = await Promise.all(pagePromises);

      for (const page of pages) {
        modified.push(...page);

        if (page.length < increment || (maxLimit > 0 && modified.length >= maxLimit)) {
          const finalResponse = await searchAPI.searchPost({ search, limit: 1 });
          finalResponse.data = modified.slice(0, maxLimit > 0 ? maxLimit : undefined);
          return finalResponse;
        }

        const lastResult = page[page.length - 1];
        const sortField = search.sort![0].replace("-", "") as keyof SearchDocument;
        searchAfter = [lastResult[sortField]];
      }

      if (maxLimit > 0 && modified.length >= maxLimit) {
        break;
      }
    }

    const finalResponse = await searchAPI.searchPost({ search, limit: 1 });
    finalResponse.data = modified.slice(0, maxLimit > 0 ? maxLimit : undefined);
    return finalResponse;
  }
}
