export interface SplitOrderRequest {
    orderId?: number | string;
    diningTables: {
        id: string | null;
        name?: string | null;
    }[];
    orderDetails?: {
        id: string;
        quantity: number;
    }[];
}