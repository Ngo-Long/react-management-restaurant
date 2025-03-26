import {
    Tag,
    Flex,
    Card,
    Space,
    Badge,
    Input,
    Button,
    message,
    Calendar,
    BadgeProps,
    notification,
    CalendarProps,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ScheduleOutlined,
    FileTextOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { ColumnType } from 'antd/es/table';
import { ActionType } from '@ant-design/pro-components';

import '@/styles/client.table.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { orderDetailApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import { ModalOrderScheduled } from './container';
import React, { useEffect, useRef, useState } from 'react';
import DropdownMenu from '@/components/share/dropdown.menu';
import { IOrder, IOrderDetail } from '../../../types/backend';
import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';

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
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const orders = useSelector((state: RootState) => state.order?.result);

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await dispatch(fetchOrderByRestaurant({ query: "filter=status~'RESERVED'&sort=reservationTime,asc" }));
        } catch (error: any) {
            notification.error({ message: "Lỗi khi tải dữ liệu", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleUpdateStatus = async (orderDetail: IOrderDetail, status: 'CANCELED' | 'CONFIRMED') => {
        try {
            orderDetailApi.callUpdate({ ...orderDetail, status });
            message.success(`Cập nhật trạng thái thành công: ${status}`);
            fetchData();
        } catch (error: any) {
            notification.error({ message: "Lỗi cập nhật trạng thái", description: error.message });
        }
    };

    const formatCSV = (data: IOrder[]) => {
        const excludeKeys = [
            'createdBy', 'createdDate',
            'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof IOrder>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof IOrder, any>)
        })
    }

    const columns: ColumnType<IOrder>[] = [
        {
            title: 'Mã đặt bàn',
            key: 'id',
            dataIndex: 'id',
            render: (_, record) => {
                return (
                    <>
                        DB-{record.id}
                    </>
                );
            }
        },
        {
            title: 'Thời gian đến',
            key: 'reservationTime',
            dataIndex: 'reservationTime',
            render: (_, record) => {
                const date = dayjs(record.reservationTime);
                return (
                    <>
                        {date.format('HH:mm DD-MM-YYYY')} <br />
                        bởi {record.user?.name}
                    </>
                );
            }
        },
        {
            title: 'Khách hàng',
            key: 'user',
            dataIndex: 'user',
            render: (_, record) => {
                return (
                    <>
                        {`${record.user?.name} (${record.user?.phoneNumber || 'Không có số'})`}
                    </>
                );
            }
        },
        {
            title: 'Số khách',
            key: 'guestCount',
            dataIndex: 'guestCount',
        },
        {
            title: 'Phòng/bàn',
            key: 'order.diningTable',
            dataIndex: ['order', 'diningTable'],
            render: (_, { diningTables = [] }) => (
                <Space size="small" wrap>
                    {diningTables.map((table) => (
                        <Tag
                            key={table.id}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        >
                            {table.name}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                const statusConfig = {
                    RESERVED: { color: '#fa8c16', text: 'Đang chờ' },
                    CANCELED: { color: '#ff4d4f', text: 'Đã hủy' },
                    PENDING: { color: '#52c41a', text: 'Đã nhận bàn' }
                } as const;
                const config = statusConfig[status as keyof typeof statusConfig] || { color: '#ff4d4f', text: 'Đã hủy' };

                return (
                    <Space>
                        <Badge color={config.color} />
                        <span style={{ fontWeight: 500, color: config.color }}>
                            {config.text}
                        </span>
                    </Space>
                );
            },
        },
        {
            title: 'Tác vụ',
            align: "center",
            render: (_, record) => (
                <Flex wrap gap="small">
                    <Button type="primary" danger onClick={() => handleUpdateStatus(record, 'CONFIRMED')}>
                        Cập nhật
                    </Button>
                </Flex>
            ),
        },
    ];

    // Thêm các hàm mới cho Calendar
    const getListData = (value: Dayjs) => {
        // Lọc các đơn đặt bàn trong ngày được chọn
        const ordersInDay = orders.filter(order => {
            const orderDate = dayjs(order.reservationTime);
            return orderDate.isSame(value, 'day');
        });

        // Chuyển đổi orders thành listData
        return ordersInDay.map(order => {
            // Xác định type dựa vào status
            let type: string;
            switch (order.status) {
                case 'RESERVED':
                    type = 'warning';
                    break;
                case 'PENDING':
                    type = 'success';
                    break;
                case 'CANCELED':
                    type = 'error';
                    break;
                default:
                    type = 'warning';
            }

            // Format nội dung hiển thị
            const time = dayjs(order.reservationTime).format('HH:mm');
            const tables = order.diningTables?.map(t => t.name).join(', ');
            const content = `${tables} (${time})`;

            return {
                type,
                content
            };
        });
    };

    // Cập nhật hàm getMonthData để hiển thị tổng số đơn trong tháng
    const getMonthData = (value: Dayjs) => {
        const ordersInMonth = orders.filter(order => {
            const orderDate = dayjs(order.reservationTime);
            return orderDate.isSame(value, 'month');
        });

        return ordersInMonth.length > 0 ? ordersInMonth.length : null;
    };

    // Cập nhật monthCellRender để hiển thị đẹp hơn
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
            <div className="events">
                {listData.map((item) => (
                    <div key={item.content}>
                        <Badge size='small' status={item.type as BadgeProps['status']} />
                        <small>{" " + item.content}</small>
                    </div>
                ))}
            </div>
        );
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        if (info.type === 'month') return monthCellRender(current);
        return info.originNode;
    };

    const contentList: Record<string, React.ReactNode> = {
        tab1: (
            <Card type="inner">
                <Calendar cellRender={cellRender} />
            </Card>
        ),
        tab2: (
            <>
                <Flex gap="middle" justify="space-between" style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Tìm kiếm đơn đặt bàn..."
                        allowClear
                        style={{ width: 300 }}
                        enterButton={<SearchOutlined />}
                    />
                    <Flex gap="small">
                        <Button onClick={handleExportAsXlsx(orders, formatCSV)}>
                            <FileExcelOutlined /> Xuất file
                        </Button>
                        <Button type="primary" onClick={() => setOpenModal(true)}>
                            <PlusOutlined /> Đặt bàn
                        </Button>
                    </Flex>
                </Flex>

                <Table<IOrder>
                    key={orders.length}
                    loading={loading}
                    columns={columns}
                    dataSource={orders}
                    pagination={false}
                    size='large'
                    className="order-table"
                    rowClassName="order-table-row"
                    rowKey={(record) => record.id || ''}
                    scroll={{ y: 50 * 9 }}
                />
            </>
        )
    };

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    return (
        <Flex>
            <Card title="Lịch đặt bàn" style={{ width: 300 }}>
                <Calendar fullscreen={false} onPanelChange={onPanelChange} />
            </Card>

            <Card
                tabList={[
                    { key: 'tab1', tab: 'Theo lịch', icon: <ScheduleOutlined /> },
                    { key: 'tab2', tab: 'Theo danh sách', icon: <FileTextOutlined /> }
                ]}
                bordered={true}
                className={'no-select'}
                style={{ height: '100vh' }}
                activeTabKey={activeTabKey}
                tabBarExtraContent={<DropdownMenu />}
                onTabChange={(key) => setActiveTabKey(key)}
            >
                {contentList[activeTabKey]}
            </Card>

            <ModalOrderScheduled
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
            />
        </Flex>
    );
};

export default ReceptionClient;
