import {
    Row,
    Col,
    Card,
    message,
    Calendar,
    notification,
    CalendarProps,
} from 'antd';
import {
    ScheduleOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';

import '@/styles/client.table.scss';
import CalendarModal from './calendar.card';
import { orderApi } from '@/config/api';
import { IOrder } from '@/types/backend';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import TableCalendarModal from './table.card';
import { useAppDispatch } from '@/redux/hooks';
import { ModalOrderScheduled } from './container';
import React, { useEffect, useRef, useState } from 'react';
import DropdownMenu from '@/components/share/dropdown.menu';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';
import { defaultStatuses, OrderStatus } from '@/utils/statusConfig';

import 'dayjs/locale/vi';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const ReceptionClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const orders = useSelector((state: RootState) => state.order?.result);

    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>(defaultStatuses);

    useEffect(() => {
        fetchData();
    }, [selectedStatuses]);

    const fetchData = () => {
        const query = buildQuery(selectedStatuses);
        dispatch(fetchOrderByRestaurant({ query }));
    };

    const buildQuery = (statuses: OrderStatus[]): string => {
        const statusFilter = statuses.length > 0
            ? statuses.map(status => `status~'${status}'`).join(' or ')
            : "";
    
        let query = "filter=option~'SCHEDULED'";
        if (statusFilter) query += ` and (${statusFilter})`;
        query += "&sort=reservationTime,asc";
    
        return query;
    };
    
    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleUpdateStatus = async (order: IOrder, status: OrderStatus) => {
        setLoading(true);
        try {
            if (order.status === OrderStatus.COMPLETED) {
                message.error('Phiếu đặt bàn đã được thanh toán. Bạn không thể cập nhật.');
                return;
            }

            if (order.status === OrderStatus.PENDING) {
                message.error('Khách đang được phục vụ. Bạn phải hủy đơn hàng trước.');
                return;
            }

            if (status === OrderStatus.DELETE) {
                await orderApi.callDelete(order?.id || '');
                message.success(`Xóa phiếu đặt bàn thành công`);
            } else {
                await orderApi.callUpdate({ ...order, status });
                message.success(`Cập nhật trạng thái thành công`);
            }

            fetchData();
            reloadTable();
        } catch (error: any) {
            notification.error({ message: "Lỗi cập nhật trạng thái", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // const submitOrderScheduled = async (valuesForm: IOrder) => {
    //     try {
    //         const { diningTables, guestCount, note, client } = valuesForm;
    //         if (!client) {
    //             throw new Error('Vui lòng chọn khách hàng');
    //         }

    //         const reservationTime = selectedDate
    //             .hour(selectedTime.hour())
    //             .minute(selectedTime.minute())
    //             .second(0);

    //         const minAllowedTime = dayjs().add(15, 'minute');
    //         if (reservationTime.isBefore(minAllowedTime)) {
    //             throw new Error('Thời gian đặt bàn phải sau thời gian hiện tại ít nhất 15 phút');
    //         }

    //         const tables = diningTables === undefined ? [] : diningTables;
    //         const status = tables.length > 0 ? OrderStatus.RESERVED : OrderStatus.WAITING;

    //         const orderScheduled: IOrder = {
    //             id: selectedOrder?.id,
    //             note,
    //             guestCount,
    //             option: 'SCHEDULED',
    //             status,
    //             reservationTime: reservationTime.toISOString(),
    //             client: { id: client.id },
    //             diningTables: (tables as string[]).map(tableId => ({
    //                 id: tableId
    //             }))
    //         };

    //         const res = selectedOrder?.id
    //             ? await orderApi.callUpdate(orderScheduled)
    //             : await orderApi.callCreate(orderScheduled);

    //         if (res.data) {
    //             message.success(selectedOrder?.id ? "Cập nhật lịch đặt thành công" : "Thêm mới lịch đặt thành công");
    //             setSelectedOrder(null);
    //             fetchData();
    //             reloadTable();
    //         }
    //     } catch (error: any) {
    //         notification.error({
    //             message: 'Có lỗi xảy ra',
    //             description: error.message
    //         });
    //     }
    // }

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    const handleStatusChange = (checkedValues: OrderStatus[]) => {
        setSelectedStatuses(checkedValues);
    };

    const contentList: Record<string, React.ReactNode> = {
        tab1: (
            <CalendarModal
                dataOrders={orders}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                openModal={openModal}
                setOpenModal={setOpenModal}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                loading={loading}
            />
        ),
        tab2: (
            <TableCalendarModal
                dataOrders={orders}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                openModal={openModal}
                setOpenModal={setOpenModal}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                handleUpdateStatus={handleUpdateStatus}
                loading={loading}
            />
        )
    };

    return (
     <>
        <Row>
            <Col span={5}>
                <Card title="Lịch đặt bàn" style={{ height: '100%' }} >
                    <Calendar fullscreen={false} onPanelChange={onPanelChange} />
                </Card>
            </Col>

            <Col span={19}>
                <Card
                    tabList={[
                        { key: 'tab1', tab: 'Theo lịch', icon: <ScheduleOutlined /> },
                        { key: 'tab2', tab: 'Theo danh sách', icon: <FileTextOutlined /> }
                    ]}
                    bordered={true}
                    className={'no-select'}
                    style={{ minHeight: '100vh' }}
                    activeTabKey={activeTabKey}
                    tabBarExtraContent={<DropdownMenu />}
                    onTabChange={(key) => setActiveTabKey(key)}
                >
                    {contentList[activeTabKey]}
                </Card>
            </Col>
        </Row>

        <ModalOrderScheduled
            openModal={openModal}
            setOpenModal={setOpenModal}
            reloadTable={reloadTable}
            fetchData={fetchData}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            handleUpdateStatus={handleUpdateStatus}
        />
     </>
    );
};

export default ReceptionClient;
