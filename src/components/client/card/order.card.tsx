import React, { useEffect, useState } from 'react';
import {
    AlertOutlined, DeleteOutlined, PlusOutlined,
    MenuOutlined, MinusOutlined, DollarOutlined,
    HourglassOutlined
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { Card, Table, Dropdown, Space, Button, message, notification } from 'antd';
import { authApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { orderApi, orderDetailApi } from "@/config/api";
import { IOrder, IOrderDetail } from '@/types/backend';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchOrderDetailsByOrderId } from '@/redux/slice/orderDetailSlide';

interface OrderCardProps {
    orderItems: {
        id: number;
        name: string;
        quantity: number;
        sellingPrice: number;
    }[];
    onRemoveItem: (id: number) => void;
    onChangeQuantity: (id: number, delta: number) => void;
    currentDiningTable: { id: string | null; name: string | null };
    orderItemsByTable: Record<string, any[]>;
    setOrderItemsByTable: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
    onTabChange: (key: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
    orderItems,
    onRemoveItem,
    onChangeQuantity,
    currentDiningTable,
    orderItemsByTable,
    setOrderItemsByTable,
    onTabChange
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [note, setNote] = useState<string>('');
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    useEffect(() => {
        if (currentOrder?.id) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder.id));
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

    const totalPrice = orderItems.reduce((sum, item) => {
        return sum + item.sellingPrice * item.quantity
    }, 0);

    const columns = [
        {
            title: 'Mã chi tiết',
            key: 'id',
            dataIndex: 'id',
            // hidden: true,
            width: 20,
            // render: (text, record, index, action) => { record.id },
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record: any) => (
                <span style={{ fontSize: '15px' }}>
                    <DeleteOutlined
                        style={{ cursor: 'pointer', color: 'red', fontSize: '17px' }}
                        onClick={() => onRemoveItem(record.id)}
                    />
                    <HourglassOutlined style={{ cursor: 'pointer', color: 'green', fontSize: '16px' }} />
                    &nbsp; {value}
                </span>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: "center" as const,
            width: 100,
            render: (value: number, record: any) => (
                <span style={{ fontSize: '15px' }}>
                    <MinusOutlined className='order-icon' onClick={() => onChangeQuantity(record.id, -1)} />
                    &nbsp;  &nbsp;
                    {value}
                    &nbsp;  &nbsp;
                    <PlusOutlined className='order-icon' onClick={() => onChangeQuantity(record.id, 1)} />
                </span>
            )
        },
        {
            title: 'T.Tiền',
            dataIndex: 'sellingPrice',
            key: 'sellingPrice',
            width: 90,
            align: "center" as const,
            render: (value: number, record: any) => {
                return <span style={{ fontSize: '15px' }}>
                    {(record.quantity * value).toLocaleString()} đ
                </span>
            }
        }
    ];

    const handleSubmitOrder = async (status: 'PENDING' | 'COMPLETED') => {
        const order = {
            id: currentOrder?.id || undefined,
            note,
            status,
            diningTable: currentDiningTable,
            orderDetails: orderItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
            })),
        };

        const res = currentOrder?.id
            ? await orderApi.callUpdate(order)
            : await orderApi.callCreate(order);

        if (res.data) {
            message.success(`${currentOrder?.id ? 'Cập nhật' : 'Tạo mới'} đơn hàng thành công`);

            // delete dish and config new status
            if (status === 'COMPLETED') {
                // delete info dish of dining table current
                setOrderItemsByTable(prevState => ({
                    ...prevState,
                    [currentDiningTable.id!]: [],
                }));

                onTabChange('tab1');    // back to tab 1
                setCurrentOrder(null);  // update order
            }

            (status === 'PENDING') && setCurrentOrder(res.data);  // update order
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }
    }

    return (
        <Card
            type="inner"
            title={`Đơn hàng [${currentOrder?.id}] ─ ${currentDiningTable?.name}`}
            bordered={true}
            style={{ height: '100vh' }}
            extra={
                <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                    <Space style={{ cursor: "pointer" }}>
                        KL - Phục vụ
                        <MenuOutlined />
                    </Space>
                </Dropdown>
            }
        >
            <div className="container container-order">
                <div style={{ height: '70%' }}>
                    {orderItems.length === 0 ? (
                        <div className='order-table'>
                            <svg _ngcontent-cta-c34="" fill="none" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg"><path _ngcontent-cta-c34="" d="M4.53105 11.25L6.41386 30.8047C6.47636 31.4062 6.8123 31.9219 7.29667 32.2188C7.58573 32.3984 7.92167 32.5 8.28105 32.5H10.0389C10.0154 32.75 9.9998 33 9.9998 33.25C9.9998 34.2969 10.1717 35.3125 10.4998 36.25H8.28105C5.38261 36.25 2.96073 34.0469 2.67948 31.1641L0.0154212 3.42188C-0.164266 1.58594 1.28105 0 3.1248 0H24.1248C25.9685 0 27.4139 1.58594 27.2342 3.42188L26.3592 12.5H26.2498C24.992 12.5 23.7576 12.5938 22.5701 12.7812L22.7185 11.25H4.53105ZM4.17167 7.5H23.0701L23.4373 3.75H3.8123L4.17167 7.5ZM12.4998 33.25V33.2188C12.4998 32.9766 12.5232 32.75 12.5623 32.5234C12.5623 32.5156 12.5623 32.5078 12.5623 32.5C12.5701 32.4375 12.5857 32.3672 12.6014 32.3047C12.6873 31.8828 12.8357 31.4922 13.031 31.125C12.6951 30.625 12.4998 30.0234 12.4998 29.375C12.4998 28.4844 12.8748 27.6719 13.4764 27.1094C13.1873 26.6562 12.9529 26.1562 12.7889 25.6328C12.6014 25.0391 12.4998 24.4062 12.4998 23.75C12.4998 19.7891 16.6404 16.4375 22.3201 15.3594C23.5232 15.1328 24.8045 15.0078 26.1248 15C26.1639 15 26.2107 15 26.2498 15C33.8435 15 39.9998 18.9141 39.9998 23.75C39.9998 24.9844 39.6404 26.1328 39.0232 27.1094C39.6248 27.6797 39.9998 28.4844 39.9998 29.375C39.9998 30.0234 39.8045 30.625 39.4685 31.125C39.8123 31.7578 39.9998 32.4844 39.9998 33.25C39.9998 36.9766 36.9764 40 33.2498 40H19.2498C16.6014 40 14.3045 38.4688 13.2029 36.25C12.7576 35.3438 12.4998 34.3281 12.4998 33.25ZM19.1326 36.25C19.1717 36.25 19.2107 36.25 19.2498 36.25H33.2498C34.906 36.25 36.2498 34.9062 36.2498 33.25C36.2498 32.8359 35.9139 32.5 35.4998 32.5H16.9998C16.5857 32.5 16.2498 32.8359 16.2498 33.25C16.2498 34.0391 16.5545 34.7578 17.0545 35.2969C17.5779 35.8594 18.3123 36.2188 19.1326 36.25ZM33.7498 26.25C34.0857 26.25 34.406 26.1875 34.7029 26.0625C34.8982 25.9844 35.0857 25.875 35.2576 25.75C36.031 24.9609 36.2498 24.2344 36.2498 23.75C36.2498 23.0625 35.8045 21.8984 33.9607 20.7266L33.7498 20.5938V20.625C33.7498 21.3125 33.1873 21.875 32.4998 21.875C32.2264 21.875 31.9685 21.7891 31.7576 21.6328C31.4451 21.4062 31.2498 21.0391 31.2498 20.625C31.2498 20.2344 31.4295 19.875 31.7185 19.6484C31.3357 19.5156 30.9373 19.3906 30.5232 19.2812C29.5545 19.0312 28.492 18.8516 27.3514 18.7812C27.4451 18.9531 27.4998 19.1562 27.4998 19.375C27.4998 20.0625 26.9373 20.625 26.2498 20.625C26.0154 20.625 25.8045 20.5625 25.617 20.4531C25.531 20.4062 25.4529 20.3438 25.3826 20.2812C25.3435 20.2422 25.3045 20.2031 25.2654 20.1562C25.2498 20.1406 25.2342 20.1172 25.2264 20.1016C25.2185 20.0937 25.2107 20.0781 25.2029 20.0703C25.1717 20.0312 25.1482 19.9844 25.1248 19.9453C25.0389 19.7734 24.992 19.5859 24.992 19.3828V19.375C24.992 19.2734 25.0076 19.1797 25.031 19.0859C25.0467 19.0312 25.0623 18.9844 25.0779 18.9375C25.0935 18.9062 25.1014 18.875 25.117 18.8438L25.1248 18.8281C25.1326 18.8203 25.1326 18.8047 25.1404 18.7969C25.0701 18.8047 24.992 18.8047 24.9217 18.8125C24.8826 18.8125 24.8435 18.8203 24.7967 18.8203C24.7185 18.8281 24.6404 18.8359 24.5701 18.8438C23.1717 18.9766 21.8904 19.2656 20.7732 19.6641C21.0623 19.8906 21.242 20.2422 21.242 20.6406C21.242 21.0156 21.0779 21.3438 20.8279 21.5703C20.6092 21.7656 20.3123 21.8906 19.992 21.8906C19.3045 21.8906 18.742 21.3281 18.742 20.6406V20.6094L18.531 20.7422C16.6873 21.9141 16.242 23.0781 16.242 23.7656C16.242 24.25 16.4607 24.9688 17.242 25.7656C17.6639 26.0781 18.1795 26.2656 18.742 26.2656H33.742L33.7498 26.25Z" fill="#ff4d4f"></path></svg>
                            <div style={{ marginTop: '10px' }}> Chưa có món trong đơn.</div>
                            <div> Vui lòng chọn món trong thực đơn bên trái màn hình.</div>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={orderItems.map(item => ({ ...item, key: item.id }))}
                            pagination={false}
                            size='middle'
                            showHeader={false}
                            scroll={{ y: 50 * 7 }}
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
                            <span>&nbsp;({orderItems.length} món)</span>
                        </div>

                        <div className='order-total__price'>{totalPrice.toLocaleString()} đ</div>
                    </div>

                    <div className='order-btn'>
                        <Button
                            danger
                            className='order-btn__alert'
                            disabled={orderItems.length === 0}
                            onClick={() => handleSubmitOrder('PENDING')}
                            icon={<AlertOutlined style={{ fontSize: '18px' }} />}
                        >
                            THÔNG BÁO
                        </Button>

                        <Button
                            type="primary"
                            className='order-btn__pay'
                            disabled={orderItems.length === 0}
                            onClick={() => handleSubmitOrder('COMPLETED')}
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
