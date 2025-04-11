export enum OrderStatus {
    DELETE = 'DELETE',
    WAITING = 'WAITING',
    PENDING = 'PENDING',
    RESERVED = 'RESERVED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED',
}

export const defaultStatuses: OrderStatus[] = [
    OrderStatus.WAITING,
    OrderStatus.RESERVED,
    OrderStatus.PENDING
];

export const StatusBadgeMap = {
    WAITING: { color: '#fa8c16', text: 'Chờ xếp bàn' },
    RESERVED: { color: '#52c41a', text: 'Đã xếp bàn' },
    PENDING: { color: '#1890ff', text: 'Đã nhận bàn' },
    CANCELED: { color: '#ff4d4f', text: 'Đã huỷ' }
};
