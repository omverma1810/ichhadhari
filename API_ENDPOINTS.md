# API Endpoints

This document outlines the API endpoints for the backend, organized by application module.

## Authentication API

**Base Path:** `/api/auth/`

| Endpoint             | Method       | Description                                       | Payload/Parameters                                                                                            |
| -------------------- | ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/register/`         | `POST`       | Register a new user.                              | `username`, `email`, `password`, `confirm_password`, `first_name`, `last_name`, `phone`, `role`, `department` |
| `/login/`            | `POST`       | Authenticate a user and get tokens.               | `email`, `password`                                                                                           |
| `/logout/`           | `POST`       | Logout the user and invalidate the refresh token. | `refresh_token`                                                                                               |
| `/me/`               | `GET`, `PUT` | Get or update the current user's profile.         | `first_name`, `last_name`, `phone` (for PUT)                                                                  |
| `/change-password/`  | `POST`       | Change the current user's password.               | `old_password`, `new_password`, `confirm_new_password`                                                        |
| `/check-permission/` | `POST`       | Check if the user has a specific permission.      | `permission`                                                                                                  |
| `/token/refresh/`    | `POST`       | Refresh the JWT access token.                     | `refresh`                                                                                                     |

## Dashboard API

**Base Path:** `/api/dashboard/`

| Endpoint                   | Method | Description                                         |
| -------------------------- | ------ | --------------------------------------------------- |
| `/stats/`                  | `GET`  | Get dashboard statistics with trends.               |
| `/milk-collection-trends/` | `GET`  | Get milk collection trends over a specified period. |
| `/production-summary/`     | `GET`  | Get a summary of production batches.                |
| `/inventory-status/`       | `GET`  | Get the current status of the inventory.            |
| `/supplier-performance/`   | `GET`  | Get performance metrics for suppliers.              |

## Employee Management API

**Base Path:** `/api/employees/`

| Resource            | Endpoints                    | Methods                | Description                                       |
| ------------------- | ---------------------------- | ---------------------- | ------------------------------------------------- |
| Departments         | `/departments/`              | `GET`, `POST`          | List all departments or create a new one.         |
|                     | `/departments/{id}/`         | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a department.         |
| Employees           | `/employees/`                | `GET`, `POST`          | List all employees or create a new one.           |
|                     | `/employees/{id}/`           | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete an employee.          |
| Attendance          | `/attendance/`               | `GET`, `POST`          | List all attendance records or create a new one.  |
|                     | `/attendance/{id}/`          | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete an attendance record. |
| Leave Types         | `/leave-types/`              | `GET`, `POST`          | List all leave types or create a new one.         |
|                     | `/leave-types/{id}/`         | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a leave type.         |
| Leave Balances      | `/leave-balances/`           | `GET`                  | List all leave balances.                          |
|                     | `/leave-balances/{id}/`      | `GET`                  | Retrieve a specific leave balance.                |
| Leave Requests      | `/leave-requests/`           | `GET`, `POST`          | List all leave requests or create a new one.      |
|                     | `/leave-requests/{id}/`      | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a leave request.      |
| Performance Reviews | `/performance-reviews/`      | `GET`, `POST`          | List all performance reviews or create a new one. |
|                     | `/performance-reviews/{id}/` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a performance review. |
| Salary Structures   | `/salary-structures/`        | `GET`, `POST`          | List all salary structures or create a new one.   |
|                     | `/salary-structures/{id}/`   | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a salary structure.   |
| Payroll Records     | `/payroll-records/`          | `GET`, `POST`          | List all payroll records or create a new one.     |
|                     | `/payroll-records/{id}/`     | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a payroll record.     |

## Inventory API

**Base Path:** `/api/inventory/`

| Resource           | Endpoints          | Methods                | Description                                    |
| ------------------ | ------------------ | ---------------------- | ---------------------------------------------- |
| Inventory Items    | `/items/`          | `GET`, `POST`          | List all inventory items or create a new one.  |
|                    | `/items/{id}/`     | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete an inventory item. |
| Stock Transactions | `/transactions/`   | `GET`                  | List all stock transactions.                   |
| Raw Materials      | `/raw-materials/`  | `GET`                  | List all raw material stock.                   |
| Finished Goods     | `/finished-goods/` | `GET`                  | List all finished goods stock.                 |
| Stock Alerts       | `/alerts/`         | `GET`                  | List all stock alerts.                         |

## Milk Management API

**Base Path:** `/api/milk/`

| Resource         | Endpoints            | Methods                | Description                                    |
| ---------------- | -------------------- | ---------------------- | ---------------------------------------------- |
| Suppliers        | `/suppliers/`        | `GET`, `POST`          | List all suppliers or create a new one.        |
|                  | `/suppliers/{id}/`   | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a supplier.        |
| Milk Collections | `/collections/`      | `GET`, `POST`          | List all milk collections or create a new one. |
|                  | `/collections/{id}/` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a milk collection. |
| Milk Payments    | `/payments/`         | `GET`, `POST`          | List all milk payments or create a new one.    |
|                  | `/payments/{id}/`    | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a milk payment.    |

## Production API

**Base Path:** `/api/production/`

| Resource             | Endpoints          | Methods                | Description                                        |
| -------------------- | ------------------ | ---------------------- | -------------------------------------------------- |
| Products             | `/products/`       | `GET`, `POST`          | List all products or create a new one.             |
|                      | `/products/{id}/`  | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a product.             |
| Production Batches   | `/batches/`        | `GET`, `POST`          | List all production batches or create a new one.   |
|                      | `/batches/{id}/`   | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a production batch.    |
| Production Schedules | `/schedules/`      | `GET`, `POST`          | List all production schedules or create a new one. |
|                      | `/schedules/{id}/` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a production schedule. |

## Vendor Management API

**Base Path:** `/api/vendors/`

| Resource            | Endpoints                | Methods                | Description                                       |
| ------------------- | ------------------------ | ---------------------- | ------------------------------------------------- |
| Vendors             | `/vendors/`              | `GET`, `POST`          | List all vendors or create a new one.             |
|                     | `/vendors/{id}/`         | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a vendor.             |
| Purchase Orders     | `/purchase-orders/`      | `GET`, `POST`          | List all purchase orders or create a new one.     |
|                     | `/purchase-orders/{id}/` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a purchase order.     |
| Vendor Payments     | `/payments/`             | `GET`, `POST`          | List all vendor payments or create a new one.     |
|                     | `/payments/{id}/`        | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a vendor payment.     |
| Goods Receipt Notes | `/grns/`                 | `GET`, `POST`          | List all goods receipt notes or create a new one. |
|                     | `/grns/{id}/`            | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a goods receipt note. |
