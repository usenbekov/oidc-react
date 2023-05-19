"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = void 0;
const useAuth_1 = require("./useAuth");
const react_1 = __importDefault(require("react"));
function withAuth(Component) {
    const displayName = `withAuth(${Component.displayName || Component.name})`;
    const C = (props) => {
        const auth = useAuth_1.useAuth();
        return react_1.default.createElement(Component, Object.assign({}, props, auth));
    };
    C.displayName = displayName;
    return C;
}
exports.withAuth = withAuth;
