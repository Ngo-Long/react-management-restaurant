export const ALL_PERMISSIONS = {
    RESTAURANTS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/restaurants', module: "RESTAURANTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/restaurants', module: "RESTAURANTS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/restaurants', module: "RESTAURANTS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/restaurants/{id}', module: "RESTAURANTS" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/users', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/users', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/users', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/users/{id}', module: "USERS" },
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/roles', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/roles', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/roles', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/roles/{id}', module: "ROLES" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/permissions/{id}', module: "PERMISSIONS" },
    },
    DININGTABLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/dining-tables', module: "DININGTABLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/dining-tables', module: "DININGTABLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/dining-tables', module: "DININGTABLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/dining-tables/{id}', module: "DININGTABLES" },
    },
    ORDERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/orders', module: "ORDERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/orders', module: "ORDERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/orders', module: "ORDERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/orders/{id}', module: "ORDERS" },
    },
    ORDERDETAILS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/order-details', module: "ORDERDETAILS" },
        CREATE: { method: "POST", apiPath: '/api/v1/order-details', module: "ORDERDETAILS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/order-details', module: "ORDERDETAILS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/order-details/{id}', module: "ORDERDETAILS" },
    },
    PRODUCTS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/products', module: "PRODUCTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/products', module: "PRODUCTS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/products', module: "PRODUCTS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/products/{id}', module: "PRODUCTS" },
    },
    INVOICES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/invoices', module: "INVOICES" },
        CREATE: { method: "POST", apiPath: '/api/v1/invoices', module: "INVOICES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/invoices', module: "INVOICES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/invoices/{id}', module: "INVOICES" },
    },
}

export const ALL_MODULES = {
    FILES: 'FILES',
    RESTAURANTS: 'RESTAURANTS',
    USERS: 'USERS',
    ROLES: 'ROLES',
    PERMISSIONS: 'PERMISSIONS',
    DININGTABLES: 'DININGTABLES',
    ORDERS: 'ORDERS',
    ORDERDETAILS: 'ORDERDETAILS',
    PRODUCTS: 'PRODUCTS',
    INVOICES: 'INVOICES'
}
