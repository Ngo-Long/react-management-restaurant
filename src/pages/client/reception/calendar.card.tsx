import {
    Flex,
    Badge,
    Select,
    Tooltip,
    Checkbox,
    Calendar,
    DatePicker,
    BadgeProps,
    CalendarProps,
} from 'antd';
import { IOrder } from "@/types/backend";
import { OrderStatus } from '@/utils/statusConfig';

import 'dayjs/locale/vi';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

declare type IProps = {
    dataOrders: IOrder[];
    selectedStatuses: OrderStatus[];
    onStatusChange: (checkedValues: OrderStatus[]) => void;
    setOpenModal: (v: boolean) => void;
    selectedOrder: IOrder | null;
    setSelectedOrder: (order: IOrder) => void;
    loading: boolean;
}

const CalendarModal = ({
    dataOrders,
    selectedStatuses,
    onStatusChange,
    setOpenModal,
    selectedOrder,
    setSelectedOrder,
    loading,
}: IProps) => {
    const getListData = (value: Dayjs) => {
        const ordersInDay = dataOrders.filter(order => {
            const orderDate = dayjs(order.reservationTime);
            return orderDate.isSame(value, 'day');
        });

        return ordersInDay.map(order => {
            let type: string;
            switch (order.status) {
                case 'WAITING': type = 'warning'; break;
                case 'RESERVED': type = 'success'; break;
                case 'PENDING': type = 'processing'; break;
                case 'CANCELED': type = 'error'; break;
                default: type = 'warning';
            }

            const time = dayjs(order.reservationTime).format('HH:mm');
            const content = `${time} ${order.client?.name}`;
            return {
                type,
                content,
                time,
                order
            };
        });
    };

    const getMonthData = (value: Dayjs) => {
        const ordersInMonth = dataOrders.filter(order => {
            const orderDate = dayjs(order.reservationTime);
            return orderDate.isSame(value, 'month');
        });

        return ordersInMonth.length > 0 ? ordersInMonth.length : null;
    };

    const monthCellRender = (value: Dayjs) => {
        const num = getMonthData(value);
        return num ? (
            <div className="notes-month">
                <section>{num}</section>
                <span>Đơn đặt bàn</span>
            </div>
        ) : null;
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <div
                style={{ height: '100%' }}
                onClick={() => {
                    setSelectedOrder({
                        reservationTime: value.toISOString()
                    });
                    setOpenModal(true)
                }}
            >
                {listData.map((item) => (
                    <Tooltip
                        key={item.content}
                        placement="right"
                        title={`${item.time} - ${item.order.client?.name} (${item.order.client?.phoneNumber})`}
                    >
                        <div
                            onClick={(e) => {
                                e.stopPropagation(); 
                                setSelectedOrder(item.order);
                                setOpenModal(true);
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            <Badge size='small' status={item.type as BadgeProps['status']} />
                            <small>{' '}{item.content}</small>
                        </div>
                    </Tooltip>
                ))}
            </div>
        );
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        if (info.type === 'month') return monthCellRender(current);
        return info.originNode;
    };

    const customHeaderRender: CalendarProps<Dayjs>['headerRender'] = ({ value, type, onChange, onTypeChange }) => {
        return (
            <Flex justify='space-between' align='center' style={{ marginBottom: 8 }}>
                <Flex gap={16} >
                    <Checkbox.Group
                        value={selectedStatuses}
                        onChange={onStatusChange}
                        options={[
                            {
                                label: <span className="status-waiting">Chờ xếp bàn</span>,
                                value: OrderStatus.WAITING
                            },
                            {
                                label: <span className="status-reserved">Đã xếp bàn</span>,
                                value: OrderStatus.RESERVED
                            },
                            {
                                label: <span className="status-pending">Đã nhận bàn</span>,
                                value: OrderStatus.PENDING
                            },
                            {
                                label: <span className="status-canceled">Đã hủy</span>,
                                value: OrderStatus.CANCELED
                            },
                        ]}
                    />
                </Flex>

                <Flex>
                    <Select
                        value={type}
                        onChange={onTypeChange}
                        options={[
                            { value: 'month', label: 'Tháng' },
                            { value: 'year', label: 'Năm' },
                        ]}
                    />
                    <DatePicker
                        picker={type}
                        value={value}
                        onChange={(date) => onChange(date as Dayjs)}
                        format={type === 'month' ? 'MM-YYYY' : 'YYYY'}
                        style={{ marginLeft: 8 }}
                    />
                </Flex>
            </Flex>
        );
    };

    return (
        <Calendar
            cellRender={cellRender}
            headerRender={customHeaderRender}
        />
    );
}

export default CalendarModal;