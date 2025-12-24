"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableType = exports.TableStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "Customer";
    UserRole["MANAGER"] = "Manager";
    UserRole["ADMIN"] = "Admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "Available";
    TableStatus["OCCUPIED"] = "Occupied";
    TableStatus["RESERVED"] = "Reserved";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
var TableType;
(function (TableType) {
    TableType["REGULAR"] = "Regular";
    TableType["VIP"] = "VIP";
})(TableType || (exports.TableType = TableType = {}));
//# sourceMappingURL=types.js.map