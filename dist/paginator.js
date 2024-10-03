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
    Paginator.paginate = function (thisArg, callbackFn, args, increment, concurrency // Added concurrency support
    ) {
        return __awaiter(this, void 0, void 0, function () {
            var params, maxLimit, modified, requests, request, responses, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = args ? args : { limit: 0, offset: 0 };
                        maxLimit = params && params.limit ? params.limit : 0;
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
                        modified = [];
                        requests = [];
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        console.log("Paginating call, offset = ".concat(params.offset));
                        request = callbackFn.call(thisArg, params).then(function (results) {
                            modified.push.apply(modified, results.data);
                            return results.data.length < increment || (modified.length >= maxLimit && maxLimit > 0);
                        });
                        requests.push(request);
                        if (!(requests.length === concurrency)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(requests)];
                    case 2:
                        responses = _b.sent();
                        if (!responses.some(function (isDone) { return isDone; })) return [3 /*break*/, 4];
                        _a = [{}];
                        return [4 /*yield*/, callbackFn.call(thisArg, params)];
                    case 3: return [2 /*return*/, __assign.apply(void 0, [__assign.apply(void 0, _a.concat([_b.sent()])), { data: modified }])];
                    case 4:
                        requests.length = 0; // Clear the batch of requests
                        _b.label = 5;
                    case 5:
                        params.offset += increment;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Paginator.paginateSearchApi = function (searchAPI, search, increment, limit, concurrency // Added concurrency support
    ) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, offset, maxLimit, modified, requests, request, responses, anyDone, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        increment = increment ? increment : 250;
                        searchParams = {
                            search: search,
                            limit: increment,
                        };
                        offset = 0;
                        maxLimit = limit ? limit : 0;
                        modified = [];
                        requests = [];
                        if (!search.sort || search.sort.length != 1) {
                            throw new Error("Search must include exactly one sort parameter to paginate properly");
                        }
                        if (!concurrency) {
                            concurrency = 1; // Default to 1 request at a time if concurrency is not provided
                        }
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        console.log("Paginating call, offset = ".concat(offset));
                        request = searchAPI.searchPost(searchParams).then(function (results) {
                            modified.push.apply(modified, results.data);
                            if (results.data.length < increment || (modified.length >= maxLimit && maxLimit > 0)) {
                                return { done: true, data: modified };
                            }
                            var lastResult = results.data[results.data.length - 1];
                            if (searchParams.search.sort) {
                                searchParams.search.searchAfter = [
                                    lastResult[searchParams.search.sort[0].replace("-", "")],
                                ];
                            }
                            else {
                                throw new Error("Search unexpectedly did not return a result we can search after!");
                            }
                            return { done: false, data: results.data };
                        });
                        requests.push(request);
                        if (!(requests.length === concurrency)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(requests)];
                    case 2:
                        responses = _b.sent();
                        anyDone = responses.some(function (response) { return response.done; });
                        if (!anyDone) return [3 /*break*/, 4];
                        _a = [{}];
                        return [4 /*yield*/, searchAPI.searchPost(searchParams)];
                    case 3: return [2 /*return*/, __assign.apply(void 0, [__assign.apply(void 0, _a.concat([_b.sent()])), { data: modified }])];
                    case 4:
                        requests.length = 0; // Clear the batch of requests
                        _b.label = 5;
                    case 5:
                        offset += increment;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return Paginator;
}());
exports.Paginator = Paginator;
//# sourceMappingURL=paginator.js.map