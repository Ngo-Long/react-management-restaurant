import React, { useEffect, useState } from 'react';
import {
    AlertOutlined, PlusOutlined, HourglassOutlined,
    MenuOutlined, MinusOutlined, DollarOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { Card, Table, Dropdown, Space, Button, message } from 'antd';
import { authApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { IOrder, IOrderDetail } from '@/types/backend';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';
import { ColumnType } from 'antd/es/table';

interface OrderCardProps {
    currentOrder: IOrder | null;
    currentDiningTable: { id: string | null; name: string | null };
}

const OrderCard: React.FC<OrderCardProps> = ({ currentOrder, currentDiningTable, }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [note, setNote] = useState<string>('');
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    useEffect(() => {
        if (currentOrder?.id) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder.id));
        } else {
            dispatch(resetOrderDetails());
        }
    }, [dispatch, currentOrder?.id]);

    const handleLogout = async () => {
        const res = await authApi.callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/login')
        }
    }

    const itemsDropdown = [
        {
            label: <Link to={'/admin'}>Trang quản trị</Link>,
            key: 'home',
        },
        {
            label: (
                <span style={{ cursor: 'pointer' }} onClick={handleLogout}>
                    Đăng xuất
                </span>
            ),
            key: 'logout',
        },
    ];

    // const totalPrice = orderItems.reduce((sum, item) => {
    //     return sum + item.sellingPrice * item.quantity
    // }, 0);

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Mã chi tiết',
            key: 'id',
            dataIndex: 'id',
            // hidden: true,
            width: 40,
            render: (text) => (text),
            // render: (text, record, index, action) => { record.id },
        },
        {
            title: 'Tên dịch vụ',
            key: 'name',
            dataIndex: 'product.name',
            render: (text, record) => (
                <Space style={{ fontSize: '16px' }}>
                    {/* <DeleteOutlined
                        style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '17px' }}
                        onClick={() => onRemoveItem(record.id)}
                    /> */}
                    <HourglassOutlined style={{ cursor: 'pointer', color: 'green', fontSize: '16px' }} />
                    {record.product?.name}
                </Space >
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: "center" as const,
            width: 100
        },
        {
            title: 'T.Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: "center" as const,
            render: (value: any, entity) => (
                <Space style={{ fontSize: '16px' }}>
                    {(entity.quantity && value) ? (entity.quantity * value).toLocaleString() : '0'}
                </Space>
            ),
        }
    ];

    return (
        <Card
            type="inner"
            title={`Đơn hàng [${currentOrder?.id}] ─ ${currentDiningTable?.name}`}
            bordered={true}
            style={{ height: '100vh' }}
            extra={
                <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                    <Space style={{ cursor: "pointer" }}>
                        Bán hàng
                        <MenuOutlined />
                    </Space>
                </Dropdown>
            }
        >
            <div className="container container-order">
                <div style={{ height: '70%' }}>
                    {orderDetails.length === 0 ? (
                        <div className='order-table'>
                            <div style={{ marginTop: '10px' }}> Chưa có món trong đơn.</div>
                            <div> Vui lòng chọn món trong thực đơn.</div>
                        </div>
                    ) : (
                        <Table<IOrderDetail>
                            columns={columns}
                            dataSource={orderDetails}
                            pagination={false}
                            size='small'
                            showHeader={false}
                            scroll={{ y: 50 * 7 }}
                            rowKey={(record) => record.id || ''}
                        />
                    )}
                </div>

                <div >
                    <div>
                        <div className='order-note'>
                            Ghi chú
                            <span>&nbsp; (Tối đa 100 kí tự)</span>
                        </div>

                        <TextArea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={100}
                            autoSize={{ minRows: 2, maxRows: 2 }}
                        />
                    </div>

                    <div className='order-total'>
                        <div className='order-total__desc'>
                            Tổng tiền
                            <span>&nbsp;(0 món)</span>
                        </div>

                        <div className='order-total__price'>0 đ</div>
                    </div>

                    <div className='order-btn'>
                        <Button
                            danger
                            className='order-btn__alert'
                            icon={<AlertOutlined style={{ fontSize: '18px' }} />}
                        >
                            THÔNG BÁO
                        </Button>

                        <Button
                            type="primary"
                            className='order-btn__pay'
                            icon={<DollarOutlined style={{ fontSize: '18px' }} />}
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;
