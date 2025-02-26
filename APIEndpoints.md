# WP Schedule Manager API Endpoints

This document provides a comprehensive list of all API endpoints available in the WP Schedule Manager plugin. All endpoints are accessible under the namespace `wp-schedule-manager/v1`.

## Authentication

All API requests require authentication. The plugin uses WordPress's built-in authentication methods, and each endpoint has specific permission checks to ensure users can only access data they are authorized to see.

## Organizations Endpoints

### Get All Organizations
- **Endpoint**: `/wp-schedule-manager/v1/organizations`
- **Method**: GET
- **Permission**: User must have permission to view organizations
- **Response**: Array of organization objects

### Create Organization
- **Endpoint**: `/wp-schedule-manager/v1/organizations`
- **Method**: POST
- **Permission**: User must have permission to create organizations
- **Request Body**: Organization data
- **Response**: Created organization object

### Get Single Organization
- **Endpoint**: `/wp-schedule-manager/v1/organizations/{id}`
- **Method**: GET
- **Permission**: User must have permission to view the specific organization
- **Response**: Organization object

### Update Organization
- **Endpoint**: `/wp-schedule-manager/v1/organizations/{id}`
- **Method**: PUT/PATCH
- **Permission**: User must have permission to update the specific organization
- **Request Body**: Updated organization data
- **Response**: Updated organization object

### Delete Organization
- **Endpoint**: `/wp-schedule-manager/v1/organizations/{id}`
- **Method**: DELETE
- **Permission**: User must have permission to delete the specific organization
- **Response**: Success message

## Users-Organizations Endpoints

### Get Users-Organizations
- **Endpoint**: `/wp-schedule-manager/v1/users-organizations`
- **Method**: GET
- **Permission**: User must have permission to view user-organization relationships
- **Response**: Array of user-organization relationship objects

### Create User-Organization Relationship
- **Endpoint**: `/wp-schedule-manager/v1/users-organizations`
- **Method**: POST
- **Permission**: User must have permission to create user-organization relationships
- **Request Body**: User-organization relationship data
- **Response**: Created user-organization relationship object

## Shifts Endpoints

### Get All Shifts
- **Endpoint**: `/wp-schedule-manager/v1/shifts`
- **Method**: GET
- **Permission**: User must have permission to view shifts
- **Response**: Array of shift objects

### Create Shift
- **Endpoint**: `/wp-schedule-manager/v1/shifts`
- **Method**: POST
- **Permission**: User must have permission to create shifts
- **Request Body**: Shift data
- **Response**: Created shift object

### Get Single Shift
- **Endpoint**: `/wp-schedule-manager/v1/shifts/{id}`
- **Method**: GET
- **Permission**: User must have permission to view the specific shift
- **Response**: Shift object

### Update Shift
- **Endpoint**: `/wp-schedule-manager/v1/shifts/{id}`
- **Method**: PUT/PATCH
- **Permission**: User must have permission to update the specific shift
- **Request Body**: Updated shift data
- **Response**: Updated shift object

### Delete Shift
- **Endpoint**: `/wp-schedule-manager/v1/shifts/{id}`
- **Method**: DELETE
- **Permission**: User must have permission to delete the specific shift
- **Response**: Success message

## Response Format

All API responses are in JSON format. Successful responses will have a 200 OK status code, while errors will have appropriate error codes (400 for bad requests, 401 for unauthorized, 403 for forbidden, 404 for not found, etc.).

## Error Handling

All endpoints return standardized error responses with the following structure:

```json
{
  "code": "error_code",
  "message": "Error message",
  "data": {
    "status": 400
  }
}
```

## Pagination

For endpoints that return collections of objects, pagination is supported through the following query parameters:

- `page`: Page number (default: 1)
- `per_page`: Number of items per page (default: 10, max: 100)

## Filtering

Many collection endpoints support filtering through query parameters. Refer to the specific endpoint documentation for available filters.
