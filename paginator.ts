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
    increment = increment || 250;
    const maxLimit = limit || 0;
    let modified: SearchDocument[] = [];

    if (!search.sort || search.sort.length !== 1) {
      throw "search must include exactly one sort parameter to paginate properly";
    }

    const sortField = search.sort[0].replace("-", "");
    let searchAfter: any[] = [];
    const concurrencyLimit = 10;

    while (true) {
      console.log(`Paginating call, searchAfter = ${JSON.stringify(searchAfter)}`);

      // Create an array of promises to fetch multiple pages concurrently
      const promises: Promise<AxiosResponse<SearchDocument[], any>>[] = [];
      for (let i = 0; i < concurrencyLimit; i++) {
        const searchParams: SearchApiSearchPostRequest = {
          search: {
            ...search,
            searchAfter: i === 0 ? searchAfter : undefined,
          },
          limit: increment,
        };
        promises.push(searchAPI.searchPost(searchParams));
      }

      // Wait for all the concurrent requests to complete
      const resultsArray = await Promise.all(promises);

      let shouldBreak = false;
      // Process each response
      for (const results of resultsArray) {
        if (results.data.length > 0) {
          modified.push(...results.data);
          const lastResult = results.data[results.data.length - 1];
          searchAfter = [(lastResult as any)[sortField]];
        }

        // If the number of returned records is less than the increment, stop fetching
        if (results.data.length < increment || (maxLimit > 0 && modified.length >= maxLimit)) {
          shouldBreak = true;
          break;
        }
      }

      if (shouldBreak || (maxLimit > 0 && modified.length >= maxLimit)) {
        break;
      }
    }

    // Prepare the final response
    const finalResponse = await searchAPI.searchPost({
      search: search,
      limit: increment,
    });
    finalResponse.data = modified.slice(0, maxLimit || modified.length);
    return finalResponse;
  }
}
