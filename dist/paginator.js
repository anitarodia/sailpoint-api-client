"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
var Paginator = /** @class */ (function () {
    function Paginator() {
    }
    Paginator.paginate = function (thisArg, callbackFn, args, increment // Make increment optional
    ) {
        return __awaiter(this, void 0, void 0, function () {
            var params, maxLimit, modified, concurrencyLimit, resultsArray, promises, i, offset, _i, resultsArray_1, results, finalResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = args ? args : { limit: 0, offset: 0 };
                        maxLimit = params && params.limit ? params.limit : 0;
                        // Set default values for increment and offset
                        if (!params.offset) {
                            params.offset = 0;
                        }
                        if (!increment) {
                            increment = 250;
                        }
                        params.limit = increment;
                        modified = [];
                        concurrencyLimit = 10;
                        resultsArray = [];
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        console.log("Paginating call, offset = ".concat(params.offset));
                        promises = [];
                        for (i = 0; i < concurrencyLimit; i++) {
                            offset = params.offset + i * increment;
                            promises.push(callbackFn.call(thisArg, __assign(__assign({}, params), { offset: offset })));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        // Wait for all the concurrent requests to complete
                        resultsArray = _a.sent();
                        // Process each response
                        for (_i = 0, resultsArray_1 = resultsArray; _i < resultsArray_1.length; _i++) {
                            results = resultsArray_1[_i];
                            modified.push.apply(modified, results.data);
                            // If the number of returned records is less than the increment, stop fetching
                            if (results.data.length < increment || (maxLimit > 0 && modified.length >= maxLimit)) {
                                results.data = modified; // Update data with the modified array
                                return [2 /*return*/, results]; // Return the last successful response
                            }
                        }
                        // Increment the offset for the next set of parallel requests
                        params.offset += increment * concurrencyLimit;
                        // If we reach the maxLimit, stop fetching
                        if (maxLimit > 0 && modified.length >= maxLimit) {
                            return [3 /*break*/, 3]; // Exit the loop if we've reached the maximum limit
                        }
                        return [3 /*break*/, 1];
                    case 3:
                        finalResponse = resultsArray[0];
                        finalResponse.data = modified; // Set the combined data
                        return [2 /*return*/, finalResponse]; // Return the final response
                }
            });
        });
    };
    Paginator.paginateSearchApi = function (searchAPI, search, increment, limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.paginateSearchApiWithConcurrency(searchAPI, search, increment, limit)];
            });
        });
    };
    Paginator.paginateSearchApiWithConcurrency = function (searchAPI, search, increment, limit, concurrency) {
        if (concurrency === void 0) { concurrency = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var maxLimit, modified, fetchPage, searchAfter, pagePromises, i, pages, _i, pages_1, page, finalResponse_1, lastResult, sortField, finalResponse;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        increment = increment || 250;
                        maxLimit = limit || 0;
                        modified = [];
                        if (!search.sort || search.sort.length !== 1) {
                            throw new Error("Search must include exactly one sort parameter to paginate properly");
                        }
                        fetchPage = function (searchAfter) { return __awaiter(_this, void 0, void 0, function () {
                            var searchParams, results;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        searchParams = {
                                            search: __assign(__assign({}, search), { searchAfter: searchAfter }),
                                            limit: increment,
                                        };
                                        return [4 /*yield*/, searchAPI.searchPost(searchParams)];
                                    case 1:
                                        results = _a.sent();
                                        return [2 /*return*/, results.data];
                                }
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 8];
                        pagePromises = [];
                        for (i = 0; i < concurrency; i++) {
                            pagePromises.push(fetchPage(searchAfter));
                        }
                        return [4 /*yield*/, Promise.all(pagePromises)];
                    case 2:
                        pages = _a.sent();
                        _i = 0, pages_1 = pages;
                        _a.label = 3;
                    case 3:
                        if (!(_i < pages_1.length)) return [3 /*break*/, 7];
                        page = pages_1[_i];
                        modified.push.apply(modified, page);
                        if (!(page.length < increment || (maxLimit > 0 && modified.length >= maxLimit))) return [3 /*break*/, 5];
                        return [4 /*yield*/, searchAPI.searchPost({ search: search, limit: 1 })];
                    case 4:
                        finalResponse_1 = _a.sent();
                        finalResponse_1.data = modified.slice(0, maxLimit > 0 ? maxLimit : undefined);
                        return [2 /*return*/, finalResponse_1];
                    case 5:
                        lastResult = page[page.length - 1];
                        sortField = search.sort[0].replace("-", "");
                        searchAfter = [lastResult[sortField]];
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7:
                        if (maxLimit > 0 && modified.length >= maxLimit) {
                            return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 1];
                    case 8: return [4 /*yield*/, searchAPI.searchPost({ search: search, limit: 1 })];
                    case 9:
                        finalResponse = _a.sent();
                        finalResponse.data = modified.slice(0, maxLimit > 0 ? maxLimit : undefined);
                        return [2 /*return*/, finalResponse];
                }
            });
        });
    };
    return Paginator;
}());
exports.Paginator = Paginator;
//# sourceMappingURL=paginator.js.map