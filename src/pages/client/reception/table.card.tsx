import {
    Tag,
    Flex,
    Space,
    Badge,
    Button,
    Tooltip,
    Checkbox,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    FormOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { IOrder } from "@/types/backend";
import { ColumnType } from 'antd/es/table';
import { convertCSV, handleExportAsXlsx } from "@/utils/file";
import { OrderStatus, StatusBadgeMap } from '@/utils/statusConfig';

import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

declare type IProps = {
    dataOrders: IOrder[];
    selectedStatuses: OrderStatus[];
    onStatusChange: (checkedValues: OrderStatus[]) => void;
    setOpenModal: (value: boolean) => void;
    selectedOrder: IOrder | null;
    setSelectedOrder: (order: IOrder) => void;
    handleUpdateStatus: (order: IOrder, status: OrderStatus) => Promise<void>;
    loading: boolean;
}

const TableCalendarModal = ({
    dataOrders,
    selectedStatuses,
    onStatusChange,
    setOpenModal,
    selectedOrder,
    setSelectedOrder,
    handleUpdateStatus,
    loading,
}: IProps) => {
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
            title: 'Mã phiếu',
            key: 'id',
            dataIndex: 'id',
            width: 60,
            align: 'center',
            render: (_, record) => (
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        setOpenModal(true);
                        setSelectedOrder(record);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {record.id}
                </a>
            )
        },
        {
            title: 'Giờ đến',
            key: 'reservationTime',
            dataIndex: 'reservationTime',
            width: 135,
            render: (_, record) => {
                const date = dayjs(record.reservationTime);
                return (<>{date.format('HH:mm - DD/MM/YYYY')}</>);
            }
        },
        {
            title: 'Khách hàng',
            key: 'client',
            dataIndex: 'client',
            width: 120,
            render: (_, record) => {
                return (<>{`${record.client?.name} (${record.client?.phoneNumber || 'Không có số'})`}</>);
            }
        },
        {
            title: 'Số khách',
            key: 'guestCount',
            dataIndex: 'guestCount',
            width: 75,
            align: 'center',
        },
        {
            title: 'Phòng/bàn',
            key: 'order.diningTable',
            dataIndex: ['order', 'diningTable'],
            width: 123,
            render: (_, { diningTables = [] }) => (
                <Flex wrap gap="6px 0" >
                    {diningTables.map((table) => (
                        <Tag
                            key={table.id}
                            style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        >
                            {table.name}
                        </Tag>
                    ))}
                </Flex>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            width: 110,
            render: (status) => {
                const config = StatusBadgeMap[status as keyof typeof StatusBadgeMap];
                return (
                    <Space>
                        <Badge color={config.color} />
                        {config.text}
                    </Space>
                );
            },
        },
        {
            title: 'Tác vụ',
            align: "center",
            width: 65,
            render: (_, entity) =>
                <Space>
                    {(entity.status === 'WAITING') &&
                        <Tooltip title="Chỉnh sửa" placement="top">
                            <FormOutlined
                                style={{ fontSize: 20, color: '#ff8400' }}
                                onClick={() => {
                                    setOpenModal(true);
                                    setSelectedOrder(entity);
                                }}
                            />
                        </Tooltip>
                    }

                    {(entity.status === 'RESERVED') &&
                        <Tooltip title="Nhận bàn" placement="top">
                            <CheckSquareOutlined
                                style={{ fontSize: 20, color: '#277500' }}
                                onClick={() => { handleUpdateStatus(entity, OrderStatus.PENDING) }}
                            />
                        </Tooltip>
                    }

                    {(entity.status !== OrderStatus.CANCELED) &&
                        <Tooltip title="Hủy đặt" placement="top">
                            <Popconfirm
                                okText="Xác nhận"
                                cancelText="Đóng"
                                placement="leftTop"
                                title={"Xác nhận hủy"}
                                description={"Bạn có muốn hủy phiếu đặt bàn này?"}
                                onConfirm={() => handleUpdateStatus(entity, OrderStatus.CANCELED)}
                            >
                                <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                            </Popconfirm>
                        </Tooltip>
                    }
                </Space >
        },
    ];

    return (
        <>
            <Flex gap="middle" justify="space-between" style={{ marginBottom: 16 }}>
                <Flex gap={16} align='center'>
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
                <Flex gap="small">
                    <Button onClick={handleExportAsXlsx(dataOrders, formatCSV)}>
                        <FileExcelOutlined /> Xuất file
                    </Button>
                    <Button type="primary" onClick={() => setOpenModal(true)}>
                        <PlusOutlined /> Đặt bàn
                    </Button>
                </Flex>
            </Flex>

            <Table<IOrder>
                key={dataOrders.length}
                loading={loading}
                columns={columns}
                pagination={false}
                dataSource={dataOrders}
                size='small'
                tableLayout="fixed"
                className="order-table"
                rowClassName="order-table-row"
                rowKey={(record) => record.id || ''}
                scroll={{ y: 'calc(100vh - 200px)' }}
                style={{ height: 'calc(100vh - 154px)' }}
            />
        </>
    );
}

export default TableCalendarModal;