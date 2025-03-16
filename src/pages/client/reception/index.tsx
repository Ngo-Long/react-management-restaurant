import {
    Tag,
    Flex,
    Card,
    Space,
    Badge,
    Input,
    Button,
    message,
    notification
} from 'antd';
import {
    FileExcelOutlined,
    FileTextOutlined,
    PlusOutlined,
    ScheduleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { ColumnType } from 'antd/es/table';
import { ActionType } from '@ant-design/pro-components';

import '@/styles/client.table.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { orderDetailApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useRef, useState } from 'react';
import DropdownMenu from '@/components/share/dropdown.menu';
import { IOrder, IOrderDetail } from '../../../types/backend';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';

import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { ModalOrderScheduled } from './container';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Configure dayjs
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const ReceptionClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('tab2');
    const orders = useSelector((state: RootState) => state.order.result);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

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
            width: 110,
        },
        {
            title: 'Thời gian đến',
            key: 'reservationTime',
            dataIndex: 'reservationTime',
            width: 180,
            render: (_, record) => {
                const date = dayjs(record.reservationTime);
                return (
                    <>
                        {date.format('HH:mm DD-MM-YYYY')} <br />
                        <small>{date.fromNow()}</small>
                    </>
                );
            }
        },
        {
            title: 'Khách hàng',
            key: 'user.name',
            dataIndex: ['user', 'name']
        },
        {
            title: 'Điện thoại',
            key: 'user.phoneNumber',
            dataIndex: ['user', 'phoneNumber']
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
            width: 170,
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
                    RESERVED: { color: '#52c41a', text: 'Đang chờ' },
                    CANCELED: { color: '#ff4d4f', text: 'Đã hủy' },
                    CONFIRMED: { color: '#1890ff', text: 'Hoàn thành' }
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
            width: 200,
            align: "center",
            render: (_, record) => (
                <Flex wrap gap="small">
                    <Button danger onClick={() => handleUpdateStatus(record, 'CANCELED')}>
                        Hủy
                    </Button>
                    <Button type="primary" danger onClick={() => handleUpdateStatus(record, 'CONFIRMED')}>
                        Hoàn thành
                    </Button>
                </Flex>
            ),
        },
    ];

    const contentList: Record<string, React.ReactNode> = {
        tab1:
            <Card type="inner" title="Inner Card title" extra={<a href="#">More</a>}>
                Inner Card content
            </Card>,
        tab2:
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
                    scroll={{ y: 50 * 10 }}
                />
            </>
    };

    return (
        <>
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
        </>
    );
};

export default ReceptionClient;
