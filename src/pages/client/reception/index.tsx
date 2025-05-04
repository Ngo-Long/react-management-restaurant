import {
    Row,
    Col,
    Card,
    Flex,
    Select,
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
import { orderApi } from '@/config/api';
import { IOrder } from '@/types/backend';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import CalendarModal from './calendar.card';
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
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const ReceptionClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const orders = useSelector((state: RootState) => state.order?.result);
    const diningTables = useSelector((state: RootState) => state.diningTable.result);

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
        if (order.status === OrderStatus.COMPLETED) {
            message.error('Phiếu đặt bàn đã được thanh toán. Bạn không thể cập nhật.');
            return;
        }

        if (order.status === OrderStatus.PENDING) {
            message.error('Khách đang được phục vụ. Bạn phải hủy đơn hàng trước.');
            return;
        }

        setLoading(true);
        try {
            if (status === OrderStatus.DELETE) {
                await orderApi.callDelete(order?.id || '');
                message.success(`Xóa phiếu đặt bàn thành công`);
            }

            if (status === OrderStatus.CANCELED) {
                await orderApi.callUpdate({ ...order, status });
                message.success(`Hủy phiếu đặt bàn thành công`);
            }

            if (status === OrderStatus.PENDING) {
                // check table
                const occupiedTablesInOrder = order.diningTables?.filter(table => {
                    const foundTable = diningTables.find(t => t.id === table.id);
                    return foundTable && foundTable.status === 'OCCUPIED';
                });

                if (occupiedTablesInOrder && occupiedTablesInOrder.length > 0) {
                    message.error(`${occupiedTablesInOrder.map(t => t.name).join(', ')} hiện đang phục vụ khách. Không thể nhận bàn.`);
                    return;
                }

                await orderApi.callUpdate({ ...order, status });
                message.success(`Cập nhật trạng thái thành công`);
            }

            fetchData();
            reloadTable();
        } catch (error: any) {
            notification.error({
                message: "Lỗi cập nhật trạng thái",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    const handleStatusChange = (checkedValues: OrderStatus[]) => {
        setSelectedStatuses(checkedValues);
    };

    const customHeaderRender: CalendarProps<Dayjs>['headerRender'] = ({ value, onChange }) => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: `Tháng ${i + 1}`
        }));

        const currentYear = dayjs().year();
        const years = Array.from({ length: 10 }, (_, i) => ({
            value: currentYear - 5 + i,
            label: `${currentYear - 5 + i}`
        }));

        return (
            <Flex justify="space-between" align="center">
                <Select
                    value={value.month()}
                    onChange={(month) => {
                        const newDate = value.month(month);
                        onChange(newDate);
                    }}
                    options={months}
                    style={{ width: '100%' }}
                />

                <Select
                    value={value.year()}
                    onChange={(year) => {
                        const newDate = value.year(year);
                        onChange(newDate);
                    }}
                    options={years}
                    style={{ width: 75, marginLeft: 10 }}
                />
            </Flex>
        );
    };

    const contentList: Record<string, React.ReactNode> = {
        tab1: (
            <CalendarModal
                dataOrders={orders}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
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
                setOpenModal={setOpenModal}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                handleUpdateStatus={handleUpdateStatus}
                loading={loading}
            />
        )
    };

    return (
        <Access permission={ALL_PERMISSIONS.ORDERS.GET_PAGINATE}>
            <Row>
                <Col span={5}>
                    <Card title="Lịch đặt bàn" style={{ height: '100%', padding: 0 }} >
                        <Calendar
                            fullscreen={false}
                            onPanelChange={onPanelChange}
                            headerRender={customHeaderRender}
                        />
                    </Card>
                </Col>

                <Col span={19}>
                    <Card
                        tabList={[
                            { key: 'tab1', tab: 'Theo lịch', icon: <ScheduleOutlined /> },
                            { key: 'tab2', tab: 'Theo danh sách', icon: <FileTextOutlined /> }
                        ]}
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
        </Access>
    );
};

export default ReceptionClient;
