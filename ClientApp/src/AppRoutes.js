"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Counter_1 = require("./components/Counter");
var FetchData_1 = require("./components/FetchData");
var Home_1 = require("./components/Home");
var AppRoutes = [
    {
        index: true,
        element: react_1.default.createElement(Home_1.Home, null)
    },
    {
        path: '/counter',
        element: react_1.default.createElement(Counter_1.Counter, null)
    },
    {
        path: '/fetch-data',
        element: react_1.default.createElement(FetchData_1.FetchData, null)
    }
];
exports.default = AppRoutes;
