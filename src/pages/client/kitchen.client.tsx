dayjs.locale('vi');
dayjs.extend(relativeTime);
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { Table } from 'antd/lib';
import '@/styles/client.table.scss';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ColumnType } from 'antd/es/table';
import { orderDetailApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import { IOrderDetail } from '../../types/backend';
import relativeTime from 'dayjs/plugin/relativeTime';
import DropdownMenu from '@/components/share/dropdown.menu';
import { Card, Button, Flex, message, notification } from 'antd';
import { fetchOrderDetailsByRestaurant } from '@/redux/slice/orderDetailSlide';

const KitchenClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    useEffect(() => {
        dispatch(fetchOrderDetailsByRestaurant({ query: "filter=status~'PENDING'&sort=createdDate,asc" }));
    }, [dispatch]);

    const handleUpdateStatus = async (orderDetail: IOrderDetail, status: 'CANCELED' | 'CONFIRMED') => {
        try {
            orderDetailApi.callUpdate({ ...orderDetail, status });
            message.success(`Cập nhật trạng thái thành công: ${status}`);
            dispatch(fetchOrderDetailsByRestaurant({ query: "filter=status~'PENDING'&sort=createdDate,asc" }));
        } catch (error: any) {
            notification.error({ message: "Lỗi cập nhật trạng thái", description: error.message });
        }
    };

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'unit',
            render: (_, record) => (
                <div className='btn-name'>
                    {`${record.unit?.productName} (${record.unit?.name})`}
                </div>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 200,
            align: "center" as const,
        },
        {
            title: 'Phòng/bàn',
            width: 200,
            dataIndex: 'diningTables',
            key: 'diningTables',
            align: "center" as const,
        },
        {
            title: 'Thời gian',
            width: 200,
            dataIndex: 'lastModifiedDate',
            align: "center" as const,
            render: (_, record) => {
                return (
                    <>
                        {dayjs(record.lastModifiedDate).format('HH:mm:ss DD-MM-YYYY')} <br />
                        <small>{`( ${dayjs(record.lastModifiedDate).fromNow()} )`}</small>
                    </>
                );
            }
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

    return (
        <Card
            title='Chờ chế biến'
            bordered={true}
            className={'no-select'}
            style={{ height: '100vh' }}
            extra={<DropdownMenu />}
        >
            <Table<IOrderDetail>
                key={orderDetails.length}
                columns={columns}
                dataSource={orderDetails}
                pagination={false}
                size='large'
                className="order-table"
                rowKey={(record) => record.id || ''}
                rowClassName="order-table-row"
                scroll={{ y: 50 * 10 }}
            />
        </Card>
    );
};

export default KitchenClient;
