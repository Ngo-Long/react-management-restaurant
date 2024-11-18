import axios from '../config/axios-customize';
import { IRestaurant } from '../types/backend';
import {
    IBackendRes, IAccount, IUser, IModelPaginate, IGetAccount,
    IRole, IDiningTable, IOrder, IProduct, IOrderDetail, IInvoice, IPermission
} from '../types/backend';

/**
 *
Module Auth
 */
export const authApi = {
    callRegister(name: string, email: string, password: string, age: number, gender: string, address: string) {
        return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address })
    },

    callLogin(username: string, password: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
    },

    callFetchAccount() {
        return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
    },

    callRefreshToken() {
        return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
    },

    callLogout() {
        return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
    },
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 *
Module Restaurant
 */
export const restaurantApi = {
    callCreate(restaurant: IRestaurant) {
        return axios.post<IBackendRes<IRestaurant>>('/api/v1/restaurants', { ...restaurant });
    },

    callUpdate(restaurant: IRestaurant) {
        return axios.put<IBackendRes<IRestaurant>>(`/api/v1/restaurants`, { ...restaurant });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IRestaurant>>(`/api/v1/restaurants/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IRestaurant>>>(`/api/v1/restaurants?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IRestaurant>>(`/api/v1/restaurants/${id}`);
    },
}

/**
 *
Module User
 */
export const userApi = {
    callCreate(user: IUser) {
        return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user });
    },

    callUpdate(user: IUser) {
        return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
    },

    callFetch(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
    }
}

/**
 *
Module Permission
 */
export const permissionApi = {
    callCreate(permission: IPermission) {
        return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission });
    },

    callUpdate(permission: IPermission, id: string) {
        return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
    }
}

/**
 *
Module Role
 */
export const roleApi = {
    callCreate(role: IRole) {
        return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role });
    },

    callUpdate(role: IRole, id: string) {
        return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
    }
}

/**
 *
Module Dining Table
 */
export const diningTableApi = {
    callCreate(table: IDiningTable) {
        return axios.post<IBackendRes<IDiningTable>>('/api/v1/dining-tables', { ...table });
    },

    callUpdate(table: IDiningTable) {
        return axios.put<IBackendRes<IDiningTable>>('/api/v1/dining-tables', { ...table });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IDiningTable>>(`/api/v1/dining-tables/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IDiningTable>>>(`/api/v1/dining-tables?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IDiningTable>>(`/api/v1/dining-tables/${id}`);
    },
}

/**
 *
Module Order
 */
export const orderApi = {
    callCreate(order: IOrder) {
        return axios.post<IBackendRes<IOrder>>('/api/v1/orders', { ...order });
    },

    callUpdate(order: IOrder) {
        return axios.put<IBackendRes<IOrder>>('/api/v1/orders', { ...order });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrder>>>(`/api/v1/orders?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
    },
}

/**
 *
Module Product
 */
export const productApi = {
    callCreate(product: IProduct) {
        return axios.post<IBackendRes<IProduct>>('/api/v1/products', { ...product });
    },

    callUpdate(product: IProduct) {
        return axios.put<IBackendRes<IProduct>>('/api/v1/products', { ...product });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IProduct>>(`/api/v1/products/${id}`);
    },

    callFetch(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IProduct>>>(`/api/v1/products?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IProduct>>(`/api/v1/products/${id}`);
    },
}

/**
 *
Module Order Detail
 */
export const orderDetailApi = {
    callCreate(orderDetail: IOrderDetail) {
        return axios.post<IBackendRes<IOrderDetail>>('/api/v1/order-details', { ...orderDetail });
    },

    callUpdate(orderDetail: IOrderDetail) {
        return axios.put<IBackendRes<IOrderDetail>>('/api/v1/order-details', { ...orderDetail });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IOrderDetail>>(`/api/v1/order-details/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrderDetail>>>(`/api/v1/order-details?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IOrderDetail>>(`/api/v1/order-details/${id}`);
    },
}

/**
 *
Module Invoice
 */
export const invoiceApi = {
    callCreate(invoice: IInvoice) {
        return axios.post<IBackendRes<IInvoice>>('/api/v1/invoices', { ...invoice });
    },

    callUpdate(invoice: IInvoice) {
        return axios.put<IBackendRes<IInvoice>>('/api/v1/invoices', { ...invoice });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IInvoice>>(`/api/v1/invoices/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IInvoice>>>(`/api/v1/invoices?${query}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IInvoice>>(`/api/v1/invoices/${id}`);
    },
}