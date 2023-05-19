"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
const react_1 = require("react");
const AuthContext_1 = require("./AuthContext");
exports.useAuth = () => {
    const context = react_1.useContext(AuthContext_1.AuthContext);
    if (!context) {
        throw new Error('AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.');
    }
    return context;
};
