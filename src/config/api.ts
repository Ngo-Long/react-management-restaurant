import axios from '../config/axios-customize';
import {
    IBackendRes, IAccount, IUser, IModelPaginate, IGetAccount,
    IRole, IDiningTable, IOrder, IProduct, IOrderDetail, IInvoice,
    IIngredient, IReceipt, IRestaurant, ISupplier, IPermission, IUnit,
    IFeedback, IReview,
    IShift
} from '../types/backend';

/**
 *
Module Auth
 */
export const authApi = {
    callRegister(name: string, email: string, password: string, restaurant: { name: string }) {
        return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, restaurant })
    },

    callVerifyCode(email: string, verificationCode: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/verify', { email, verificationCode });
    },

    callChangePassword(email: string, password: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/change-password', { email, password });
    },

    callLogin(username: string, password: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
    },

    callForgotPassword(email: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/forgot', { email });
    },

    callFetchAccount() {
        return axios.post<IBackendRes<IGetAccount>>('/api/v1/auth/account')
    },

    callRefreshToken() {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/refresh')
    },

    callLogout() {
        return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
    },

    callFetchUser(email: string) {
        return axios.post<IBackendRes<IAccount>>('/api/v1/auth/google/user', { email });
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
    callCreateClient(user: IUser) {
        return axios.post<IBackendRes<IUser>>('/api/v1/users/clients', { ...user });
    },

    callCreate(user: IUser) {
        return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user });
    },

    callUpdate(user: IUser) {
        return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
    },

    callFetchAll(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users/by-restaurant?${query}`);
    },

    callFetchClientByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/clients/by-restaurant?${query}`);
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

    callFetchById(id: string) {
        return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
    }
}

/**
 *
Module Dining Table
 */
export const diningTableApi = {
    callBatchImport(tables: IDiningTable[]) {
        return axios.post<IBackendRes<IDiningTable[]>>('/api/v1/dining-tables/batch-import', tables);
    },

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

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IDiningTable>>>(`/api/v1/dining-tables/by-restaurant?${query}`);
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

    callFetchById(id: string) {
        return axios.get<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
    },

    callFetchByTable(id: string) {
        return axios.get<IBackendRes<IOrder>>(`/api/v1/orders/by-table/${id}`)
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrder>>>(`/api/v1/orders?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrder>>>(`/api/v1/orders/by-restaurant?${query}`);
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

    callFetchById(id: string) {
        return axios.get<IBackendRes<IProduct>>(`/api/v1/products/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IProduct>>>(`/api/v1/products?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IProduct>>>(`/api/v1/products/by-restaurant?${query}`);
    }
}

/**
 *
Module Unit
 */
export const unitApi = {
    callCreate(unit: IUnit) {
        return axios.post<IBackendRes<IUnit>>('/api/v1/units', { ...unit });
    },

    callUpdate(unit: IUnit) {
        return axios.put<IBackendRes<IUnit>>('/api/v1/units', { ...unit });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IUnit>>(`/api/v1/units/${id}`);
    },

    callFetchById(id: any) {
        return axios.get<IBackendRes<IUnit>>(`/api/v1/units/${id}`);
    },

    callFetchByProduct(id: string) {
        return axios.get<IBackendRes<IModelPaginate<IUnit>>>(`/api/v1/units/by-product?${id}`);
    }
}

/**
 *
Module Ingredient
 */
export const ingredientApi = {
    callBatchImport(ingredients: IIngredient[]) {
        return axios.post<IBackendRes<IIngredient[]>>('/api/v1/ingredients/batch-import', ingredients);
    },

    callCreate(ingredient: IIngredient) {
        return axios.post<IBackendRes<IIngredient>>('/api/v1/ingredients', { ...ingredient });
    },

    callUpdate(ingredient: IIngredient) {
        return axios.put<IBackendRes<IIngredient>>('/api/v1/ingredients', { ...ingredient });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IIngredient>>(`/api/v1/ingredients/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IIngredient>>(`/api/v1/ingredients/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IIngredient>>>(`/api/v1/ingredients?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IIngredient>>>(`/api/v1/ingredients/by-restaurant?${query}`);
    }
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

    callFetchById(id: string) {
        return axios.get<IBackendRes<IOrderDetail>>(`/api/v1/order-details/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrderDetail>>>(`/api/v1/order-details?${query}`);
    },

    callFetchByOrderId(id: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrderDetail>>>(`/api/v1/order-details/by-order/${id}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IOrderDetail>>>(`/api/v1/order-details/by-restaurant?${query}`);
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

/**
 *
Module Supplier
 */
export const supplierApi = {
    callBatchImport(suppliers: ISupplier[]) {
        return axios.post<IBackendRes<ISupplier[]>>('/api/v1/suppliers/batch-import', suppliers);
    },

    callCreate(supplier: ISupplier) {
        return axios.post<IBackendRes<ISupplier>>('/api/v1/suppliers', { ...supplier });
    },

    callUpdate(supplier: ISupplier) {
        return axios.put<IBackendRes<ISupplier>>('/api/v1/suppliers', { ...supplier });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<ISupplier>>(`/api/v1/suppliers/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<ISupplier>>(`/api/v1/suppliers/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<ISupplier>>>(`/api/v1/suppliers?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<ISupplier>>>(`/api/v1/suppliers/by-restaurant?${query}`);
    }
}

/**
 *
Module Receipt
 */
export const receiptApi = {
    callCreate(receipt: IReceipt) {
        return axios.post<IBackendRes<IReceipt>>('/api/v1/receipts', { ...receipt });
    },

    callUpdate(receipt: IReceipt) {
        return axios.put<IBackendRes<IReceipt>>('/api/v1/receipts', { ...receipt });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IReceipt>>(`/api/v1/receipts/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IReceipt>>(`/api/v1/receipts/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IReceipt>>>(`/api/v1/receipts?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IReceipt>>>(`/api/v1/receipts/by-restaurant?${query}`);
    }
}

/**
 *
Module Feedback
 */
export const feedbackApi = {
    callCreate(feedback: IFeedback) {
        return axios.post<IBackendRes<IFeedback>>('/api/v1/feedbacks', { ...feedback });
    },

    callUpdate(feedback: IFeedback) {
        return axios.put<IBackendRes<IFeedback>>('/api/v1/feedbacks', { ...feedback });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IFeedback>>(`/api/v1/feedbacks/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IFeedback>>(`/api/v1/feedbacks/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IFeedback>>>(`/api/v1/feedbacks?${query}`);
    },
}

export const reviewApi = {
    callCreate(review: IReview) {
        return axios.post<IBackendRes<IReview>>('/api/v1/reviews', { ...review });
    },

    callUpdate(review: IReview) {
        return axios.put<IBackendRes<IReview>>('/api/v1/reviews', { ...review });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IReview>>(`/api/v1/reviews/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IReview>>(`/api/v1/reviews/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IReview>>>(`/api/v1/reviews?${query}`);
    },
}

export const shiftApi = {
    callCreate(shift: IShift) {
        return axios.post<IBackendRes<IShift>>('/api/v1/shifts', { ...shift });
    },

    callUpdate(shift: IShift) {
        return axios.put<IBackendRes<IShift>>('/api/v1/shifts', { ...shift });
    },

    callDelete(id: string) {
        return axios.delete<IBackendRes<IShift>>(`/api/v1/shifts/${id}`);
    },

    callFetchById(id: string) {
        return axios.get<IBackendRes<IShift>>(`/api/v1/shifts/${id}`);
    },

    callFetchFilter(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IShift>>>(`/api/v1/shifts?${query}`);
    },

    callFetchByRestaurant(query: string) {
        return axios.get<IBackendRes<IModelPaginate<IShift>>>(`/api/v1/shifts/by-restaurant?${query}`);
    }
}