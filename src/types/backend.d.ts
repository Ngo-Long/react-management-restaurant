export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        };
        restaurant: {
            id: string,
            name: string
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface IRestaurant {
    id?: string;
    name?: string;
    address?: string;
    description: string;
    logo: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age?: number;
    gender?: string;
    address?: string;
    role?: {
        id: string;
        name: string;
    }
    restaurant?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IDiningTable {
    id?: string;
    name?: string;
    location?: string;
    seats?: number;
    description?: string;
    status?: string;
    active: boolean;
    restaurant?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IOrder {
    id?: string;
    note?: string;
    totalPrice?: number;
    optional?: string;
    status?: string;
    user?: {
        id?: string;
        name?: string;
    };
    diningTable?: {
        id?: string | null;
        name?: string | null;
    };
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IOrderDetail {
    id?: string;
    quantity?: number;
    price?: number;
    status?: string;
    product?: {
        id?: string | null;
        name?: string;
    };
    order?: {
        id?: string | null;
        tableName?: string;
    };
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

interface IInvoice {
    id?: string;
    user?: {
        id?: string;
        name?: string;
    };
    order?: {
        id?: string;
        tableName?: string;
    };
    totalAmount?: number;
    customerPaid?: number;
    returnAmount?: number;
    method?: string;
    status?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IProduct {
    id?: string;
    name?: string;
    category?: string;
    unit?: string;
    image: string | null;
    shortDesc?: string;
    detailDesc?: string;
    active?: boolean;
    categories?: Array<{
        id?: number;
        name?: string;
        price?: number;
        isDefault?: boolean;
    }>;
    restaurant?: {
        id?: string;
        name?: string;
    }

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IIngredient {
    id?: string;
    name?: string;
    unit?: string;
    price?: number;
    category?: string;
    status?: string;
    image: string;
    initialQuantity?: number;
    minimumQuantity?: number;
    description?: string;
    active?: boolean;
    restaurant?: {
        id?: string;
        name?: string;
    }

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface ICategory {
    id?: string | number;
    name?: string;
    price?: number;
    costPrice?: number;
    default?: boolean;
    active?: boolean;
    product?: {
        id?: string;
        name?: string;
    }
    categoryDetails: Array<{
        id?: string;
        quantity?: number;
        category?: {
            id?: string;
        }
        ingredient?: {
            id?: string;
            name?: string;
        }
    }>;
}

export interface ISupplier {
    id?: string;
    name?: string;
    phone?: string;
    email?: number;
    address?: string;
    debtAmount?: number;
    totalAmount?: number;
    active?: boolean;
    restaurant?: {
        id?: string;
        name?: string;
    }

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface IReceipt {
    id?: string;
    type?: string;
    note?: string;
    totalAmount?: number;
    status?: string;
    active?: boolean;
    restaurant?: {
        id: string;
        name: string;
    }

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdDate?: string;
    lastModifiedDate?: string;
}
