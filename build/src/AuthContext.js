"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.initUserManager = exports.hasCodeInUrl = exports.AuthContext = void 0;
const react_1 = __importStar(require("react"));
const oidc_client_1 = require("oidc-client");
exports.AuthContext = react_1.default.createContext(undefined);
exports.hasCodeInUrl = (location) => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
    return Boolean(searchParams.get('code') ||
        searchParams.get('id_token') ||
        searchParams.get('session_state') ||
        hashParams.get('code') ||
        hashParams.get('id_token') ||
        hashParams.get('session_state'));
};
exports.initUserManager = (props) => {
    if (props.userManager)
        return props.userManager;
    const { authority, clientId, clientSecret, redirectUri, silentRedirectUri, postLogoutRedirectUri, responseType, scope, automaticSilentRenew, loadUserInfo, popupWindowFeatures, popupRedirectUri, popupWindowTarget, } = props;
    return new oidc_client_1.UserManager({
        authority,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        silent_redirect_uri: silentRedirectUri || redirectUri,
        post_logout_redirect_uri: postLogoutRedirectUri || redirectUri,
        response_type: responseType || 'code',
        scope: scope || 'openid',
        loadUserInfo: loadUserInfo != undefined ? loadUserInfo : true,
        popupWindowFeatures: popupWindowFeatures,
        popup_redirect_uri: popupRedirectUri,
        popupWindowTarget: popupWindowTarget,
        automaticSilentRenew,
    });
};
exports.AuthProvider = (_a) => {
    var { children, autoSignIn = true, onBeforeSignIn, onSignIn, onSignOut, location = window.location } = _a, props = __rest(_a, ["children", "autoSignIn", "onBeforeSignIn", "onSignIn", "onSignOut", "location"]);
    const [isLoading, setIsLoading] = react_1.useState(true);
    const [userData, setUserData] = react_1.useState(null);
    const [userManager] = react_1.useState(exports.initUserManager(props));
    const signOutHooks = () => __awaiter(void 0, void 0, void 0, function* () {
        setUserData(null);
        onSignOut && onSignOut();
    });
    const signInPopupHooks = () => __awaiter(void 0, void 0, void 0, function* () {
        const userFromPopup = yield userManager.signinPopup();
        setUserData(userFromPopup);
        onSignIn && onSignIn(userFromPopup);
        yield userManager.signinPopupCallback();
    });
    const isMountedRef = react_1.useRef(true);
    react_1.useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    react_1.useEffect(() => {
        const getUser = () => __awaiter(void 0, void 0, void 0, function* () {
            if (exports.hasCodeInUrl(location)) {
                const user = yield userManager.signinCallback();
                setUserData(user);
                setIsLoading(false);
                onSignIn && onSignIn(user);
                return;
            }
            const user = yield userManager.getUser();
            if ((!user || user.expired) && autoSignIn) {
                onBeforeSignIn && onBeforeSignIn();
                userManager.signinRedirect();
            }
            else if (isMountedRef.current) {
                setUserData(user);
                setIsLoading(false);
            }
            return;
        });
        getUser();
    }, [location, userManager, autoSignIn, onBeforeSignIn, onSignIn]);
    react_1.useEffect(() => {
        const updateUserData = () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield userManager.getUser();
            isMountedRef.current && setUserData(user);
        });
        userManager.events.addUserLoaded(updateUserData);
        return () => userManager.events.removeUserLoaded(updateUserData);
    }, [userManager]);
    return (react_1.default.createElement(exports.AuthContext.Provider, { value: {
            signIn: (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield userManager.signinRedirect(args);
            }),
            signInPopup: () => __awaiter(void 0, void 0, void 0, function* () {
                yield signInPopupHooks();
            }),
            signOut: () => __awaiter(void 0, void 0, void 0, function* () {
                yield userManager.removeUser();
                yield signOutHooks();
            }),
            signOutRedirect: (args) => __awaiter(void 0, void 0, void 0, function* () {
                yield userManager.signoutRedirect(args);
                yield signOutHooks();
            }),
            userManager,
            userData,
            isLoading,
        } }, children));
};
