"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
var axios_1 = __importDefault(require("axios"));
var os = __importStar(require("os"));
var path = __importStar(require("path"));
var yaml = __importStar(require("js-yaml"));
var fs = __importStar(require("fs"));
var form_data_1 = __importDefault(require("form-data"));
var Configuration = /** @class */ (function () {
    function Configuration(param) {
        if (!param) {
            param = this.getParams();
        }
        this.accessToken = param.accessToken;
        this.basePath = param.baseurl;
        this.tokenUrl = param.tokenUrl;
        this.clientId = param.clientId;
        this.clientSecret = param.clientSecret;
        if (!this.accessToken) {
            var url = "".concat(this.tokenUrl);
            var formData = new form_data_1.default();
            formData.append('grant_type', 'client_credentials');
            formData.append('client_id', this.clientId);
            formData.append('client_secret', this.clientSecret);
            this.accessToken = this.getAccessToken(url, formData);
        }
    }
    Configuration.prototype.getHomeParams = function () {
        var config = {};
        try {
            var homeDir = os.homedir();
            var configPath = path.join(homeDir, '.sailpoint', 'config.yaml');
            var doc = yaml.load(fs.readFileSync(configPath, 'utf8'));
            if (doc.authtype && doc.authtype.toLowerCase() === 'pat') {
                config.baseurl = doc.environments[doc.activeenvironment].baseurl;
                config.clientId = doc.environments[doc.activeenvironment].pat.clientid;
                config.clientSecret = doc.environments[doc.activeenvironment].pat.clientsecret;
                config.tokenUrl = config.baseurl + '/oauth/token';
            }
        }
        catch (error) {
            console.log('unable to find config file in home directory');
        }
        return config;
    };
    Configuration.prototype.getLocalParams = function () {
        var config = {};
        try {
            var configPath = './config.json';
            var jsonString = fs.readFileSync(configPath, 'utf-8');
            var jsonData = JSON.parse(jsonString);
            config.baseurl = jsonData.BaseURL;
            config.clientId = jsonData.ClientId;
            config.clientSecret = jsonData.ClientSecret;
            config.tokenUrl = config.baseurl + '/oauth/token';
        }
        catch (error) {
            console.log('unable to find config file in local directory');
        }
        return config;
    };
    Configuration.prototype.getEnvParams = function () {
        var config = {};
        config.baseurl = process.env["SAIL_BASE_URL"] ? process.env["SAIL_BASE_URL"] : "";
        config.clientId = process.env["SAIL_CLIENT_ID"] ? process.env["SAIL_CLIENT_ID"] : "";
        config.clientSecret = process.env["SAIL_CLIENT_SECRET"] ? process.env["SAIL_CLIENT_SECRET"] : "";
        config.tokenUrl = config.baseurl + '/oauth/token';
        return config;
    };
    Configuration.prototype.getParams = function () {
        var envConfig = this.getEnvParams();
        if (envConfig.baseurl) {
            return envConfig;
        }
        var localConfig = this.getLocalParams();
        if (localConfig.baseurl) {
            return localConfig;
        }
        var homeConfig = this.getHomeParams();
        if (homeConfig.baseurl) {
            console.log("Configuration file found in home directory, this approach of loading configuration will be deprecated in future releases, please upgrade the CLI and use the new 'sail sdk init config' command to create a local configuration file");
            return homeConfig;
        }
        return {};
    };
    Configuration.prototype.getAccessToken = function (url, formData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, status_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post(url, formData)];
                    case 1:
                        _a = _b.sent(), data = _a.data, status_1 = _a.status;
                        if (status_1 === 200) {
                            return [2 /*return*/, data.access_token];
                        }
                        else {
                            throw new Error("Unauthorized");
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Unable to fetch access token.  Aborting.");
                        throw new Error(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    Configuration.prototype.isJsonMime = function (mime) {
        var jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    };
    return Configuration;
}());
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map