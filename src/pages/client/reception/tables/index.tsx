import {
    Tag,
    Flex,
    Space,
    Badge,
    Button,
    message,
    Tooltip,
    Checkbox,
    Popconfirm,
    notification,
} from 'antd';
import {
    PlusOutlined,
    FormOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { ColumnType } from 'antd/es/table';
import { ActionType } from '@ant-design/pro-components';

import { orderApi } from '@/config/api';
import { useRef, useState } from 'react';
import { IOrder } from "@/types/backend";
import { ModalOrderScheduled } from './container';
import { convertCSV, handleExportAsXlsx } from "@/utils/file";

import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

declare type IProps = {
    dataOrders: IOrder[];
    fetchData: () => void;
    selectedStatuses: string[];
    onStatusChange: (checkedValues: string[]) => void;
    openModal: boolean;
    setOpenModal: (value: boolean) => void;
}

const TableCalendarModal = (props: IProps) => {
    const { dataOrders, fetchData, selectedStatuses, onStatusChange, openModal, setOpenModal } = props;
    const tableRef = useRef<ActionType>();
    const [loading, setLoading] = useState(false);
    const [dataInit, setDataInit] = useState<IOrder | null>(null);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleUpdateStatus = async (order: IOrder, status: 'CANCELED' | 'PENDING' | 'DELETE') => {
        try {
            if (order.status === 'COMPLETED') {
                message.error('Phiếu đặt bàn đã được thanh toán. Bạn không thể cập nhật.');
                return;
            }

            if (order.status === 'PENDING') {
                message.error('Khách đang được phục vụ. Bạn phải hủy đơn hàng trước.');
                return;
            }

            setLoading(true);
            if (status === 'DELETE') {
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
            width: 105,
            render: (_, record) => {
                return (<>DB-{record.id}</>);
            }
        },
        {
            title: 'Thời gian đến',
            key: 'reservationTime',
            dataIndex: 'reservationTime',
            width: 150,
            render: (_, record) => {
                const date = dayjs(record.reservationTime);
                return (<>{date.format('HH:mm - DD/MM/YYYY')}</>);
            }
        },
        {
            title: 'Khách hàng',
            key: 'client',
            dataIndex: 'client',
            width: 130,
            render: (_, record) => {
                return (<>{`${record.client?.name} (${record.client?.phoneNumber || 'Không có số'})`}</>);
            }
        },
        {
            title: 'Số khách',
            key: 'guestCount',
            dataIndex: 'guestCount',
            width: 90,
        },
        {
            title: 'Phòng/bàn',
            key: 'order.diningTable',
            dataIndex: ['order', 'diningTable'],
            width: 160,
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
            width: 125,
            render: (status) => {
                const statusConfig = {
                    WAITING: { color: '#fa8c16', text: 'Chờ xếp bàn' },
                    RESERVED: { color: '#52c41a', text: 'Đã xếp bàn' },
                    CANCELED: { color: '#ff4d4f', text: 'Đã hủy' },
                    PENDING: { color: '#1677ff', text: 'Đã nhận bàn' }
                } as const;
                const config = statusConfig[status as keyof typeof statusConfig] || { color: '#ff4d4f', text: 'Đã hủy' };

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
            width: 85,
            render: (_, entity) =>
                <Space>
                    {(entity.status === 'WAITING') &&
                        <Tooltip title="Chỉnh sửa" placement="top">
                            <FormOutlined
                                style={{ fontSize: 20, color: '#ff8400' }}
                                onClick={() => {
                                    setOpenModal(true);
                                    setDataInit(entity);
                                }}
                            />
                        </Tooltip>
                    }

                    {(entity.status === 'RESERVED') &&
                        <Tooltip title="Nhận bàn" placement="top">
                            <CheckSquareOutlined
                                style={{ fontSize: 20, color: '#277500' }}
                                onClick={() => { handleUpdateStatus(entity, 'PENDING') }}
                            />
                        </Tooltip>
                    }

                    {(entity.status !== 'CANCELED') &&
                        <Tooltip title="Hủy đặt" placement="top">
                            <Popconfirm
                                okText="Xác nhận"
                                cancelText="Hủy"
                                placement="leftTop"
                                title={"Xác nhận hủy"}
                                description={"Bạn có muốn hủy phiếu đặt bàn này?"}
                                onConfirm={() => handleUpdateStatus(entity, 'CANCELED')}
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
                                value: 'WAITING'
                            },
                            {
                                label: <span className="status-reserved">Đã xếp bàn</span>,
                                value: 'RESERVED'
                            },
                            {
                                label: <span className="status-pending">Đã nhận bàn</span>,
                                value: 'PENDING'
                            },
                            {
                                label: <span className="status-canceled">Đã hủy</span>,
                                value: 'CANCELED'
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
                dataSource={dataOrders}
                pagination={false}
                size='large'
                tableLayout="fixed"
                className="order-table"
                rowClassName="order-table-row"
                rowKey={(record) => record.id || ''}
                scroll={{ y: 'calc(100vh - 200px)' }}
                style={{ height: 'calc(100vh - 154px)' }}
            />

            <ModalOrderScheduled
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                fetchData={fetchData}
                dataInit={dataInit}
                setDataInit={setDataInit}
                handleUpdateStatus={handleUpdateStatus}
            />
        </>
    );
}

export default TableCalendarModal;