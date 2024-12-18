import {
    AlertOutlined, MenuOutlined,
    DollarOutlined, ShoppingCartOutlined, EditOutlined,
} from '@ant-design/icons';
import {
    Card, Table, Dropdown, Space, Button, message,
    notification, Modal, InputNumber, Flex
} from 'antd';
import { ColumnType } from 'antd/es/table';
import TextArea from 'antd/es/input/TextArea';

import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IOrder, IOrderDetail } from '@/types/backend';
import { authApi, invoiceApi, orderApi, orderDetailApi } from '@/config/api';

import { RootState } from '@/redux/store';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';
import InvoiceCard from './invoice.card';

interface OrderCardProps {
    currentOrder: IOrder | null;
    setCurrentOrder: (order: IOrder | null) => void;
    currentTable: { id: string | null; name: string | null };
    setActiveTabKey: (tab: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ currentOrder, setCurrentOrder, currentTable, setActiveTabKey }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [open, setOpen] = useState(false);
    const [note, setNote] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [quantityItem, setQuantityItem] = useState<number>(1);
    const [totalPriceItem, setTotalPriceItem] = useState<number>(0);

    const meta = useAppSelector(state => state.orderDetail.meta);
    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    const [customerPaid, setCustomerPaid] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [methodPaid, setMethodPaid] = useState<string>('CASH');

    useEffect(() => {
        currentOrder?.id
            ? dispatch(fetchOrderDetailsByOrderId(currentOrder.id))
            : dispatch(resetOrderDetails());
    }, [dispatch, currentOrder?.id]);

    useEffect(() => {
        if (orderDetail) {
            setQuantityItem(orderDetail.quantity || 1);
            setTotalPriceItem((orderDetail?.price || 0) * (orderDetail?.quantity || 1));
        }
    }, [orderDetail]);

    useEffect(() => {
        const totalPrice = currentOrder?.totalPrice || 0;
        setReturnAmount(Math.max(0, customerPaid - totalPrice));
    }, [customerPaid, currentOrder?.totalPrice]);

    useEffect(() => {
        if (currentOrder) {
            setCustomerPaid(0);
            setReturnAmount(0);
            setMethodPaid('CASH');
        }
    }, [currentOrder]);

    const handleLogout = async () => {
        const res = await authApi.callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/login')
        }
    }

    const handleUpdateItem = async () => {
        const res = await orderDetailApi.callUpdate({
            ...orderDetail,
            quantity: quantityItem
        });

        if (res.data) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id!));

            const order = await orderApi.callFetchById(currentOrder?.id!);
            setCurrentOrder(order.data!);
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }

        setConfirmLoading(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setConfirmLoading(false);
        }, 500);
    };

    const handleRemoveItem = async (itemId: string) => {
        // update order detail
        await orderDetailApi.callDelete(itemId);
        setIsModalOpen(false);

        if (orderDetails.length > 1) {
            const res = await orderApi.callFetchById(currentOrder?.id!);
            setCurrentOrder(res.data!);

            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id || ''));
        } else {
            await orderApi.callDelete(currentOrder?.id!);
            setCurrentOrder(null);

            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
            Modal.error({
                title: 'Hủy đơn hàng',
                content: 'Bạn vừa xóa hết món. Đơn hàng này sẽ bị hủy',
            });
        }
    };

    const handleUpdateCompletedOrder = async (currentOrder: IOrder) => {
        // update order
        const res = await orderApi.callUpdate({
            ...currentOrder,
            note,
            status: 'COMPLETED'
        });

        if (res.data) {
            setCurrentOrder(res.data);
            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
            message.success('Bếp đã được nhận thông báo');
        } else {
            notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
        }
    }

    const footerModal = () => {
        return (
            <Flex gap="small" wrap justify="space-between">
                <Button style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Hủy bỏ
                </Button>

                <Button
                    style={{ flex: 1 }}
                    danger type="primary"
                    onClick={() => handleRemoveItem(orderDetail?.id!)}
                >
                    Xóa hết
                </Button>

                <Button
                    style={{ flex: 1 }}
                    className="btn-green"
                    onClick={handleUpdateItem}
                    disabled={confirmLoading}
                >
                    Cập nhật
                </Button>
            </Flex>
        )
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

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'product.name',
            render: (text, record) => (
                <Space>
                    <EditOutlined className='btn-icon' />
                    <div className='btn-name'>
                        {record.product?.name}
                    </div>
                </Space >
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: "center" as const,
            width: 90
        },
        {
            title: 'T.Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: "center" as const,
            render: (value: any, entity) => (
                <Space>
                    {(entity.quantity && value) ? (entity.quantity * value).toLocaleString() : '0'}
                </Space>
            ),
        }
    ];

    return (
        <Card
            type="inner"
            bordered={true}
            className="custom-card"
            style={{ height: '100vh' }}
            extra={
                <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                    <Space style={{ cursor: "pointer" }}>
                        Bán hàng <MenuOutlined />
                    </Space>
                </Dropdown>
            }
            title={
                <div style={{ display: "flex", fontSize: '15px' }}>
                    <ShoppingCartOutlined style={{ fontSize: '20px', marginRight: '6px' }} />
                    {currentOrder
                        ? `Đơn hàng ${currentOrder.id} / ${currentTable?.name}`
                        : `Đơn hàng 0 / ${currentTable?.name}`
                    }
                </div>
            }
        >
            <div className="container container-order">
                <div style={{ height: '70%' }}>
                    {orderDetails.length === 0 ? (
                        <div className='order-title'>
                            <div style={{ marginTop: '10px' }}> Chưa có món trong đơn.</div>
                            <div> Vui lòng chọn món trong thực đơn.</div>
                        </div>
                    ) : (
                        <Table<IOrderDetail>
                            columns={columns}
                            dataSource={orderDetails}
                            pagination={false}
                            size='small'
                            className="order-table"
                            onRow={(record) => ({
                                onClick: () => {
                                    setIsModalOpen(true)
                                    setOrderDetail(record);
                                },
                            })}
                            rowKey={(record) => record.id || ''}
                            rowClassName="order-table-row"
                            scroll={orderDetails.length > 8 ? { y: 50 * 7 } : undefined}
                        />
                    )}
                </div>

                <div className='order-content'>
                    <div className='order-area'>
                        <div className='order-note'>
                            Ghi chú
                            <span>&nbsp; (Tối đa 100 kí tự)</span>
                        </div>

                        <TextArea
                            value={currentOrder?.note}
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

                        <div className='order-total__price'>
                            {((currentOrder?.totalPrice ?? 0) + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </div>
                    </div>

                    <div className='order-btn'>
                        <Button
                            danger
                            className='order-btn__alert'
                            disabled={currentOrder?.status !== 'PENDING'}
                            icon={<AlertOutlined style={{ fontSize: '18px' }} />}
                            onClick={() => currentOrder && handleUpdateCompletedOrder(currentOrder)}
                        >
                            THÔNG BÁO
                        </Button>

                        <Button
                            className='order-btn__pay btn-green'
                            disabled={!currentOrder}
                            onClick={() => setOpen(true)}
                            icon={<DollarOutlined style={{ fontSize: '18px' }} />}
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                className='container-modal'
                title={`
                    ${orderDetail?.product?.name} [ ${orderDetail?.id} ] -
                    ${new Date(orderDetail?.createdDate!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                `}
                width={400}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[footerModal()]}
            >
                <div className='modal-content'>
                    <div>
                        Số lượng: &nbsp;
                        <InputNumber
                            size="large"
                            style={{ width: 60 }}
                            min={1}
                            max={100}
                            defaultValue={1}
                            value={quantityItem}
                            onChange={(value: number | null) => {
                                if (value !== null) {
                                    setQuantityItem(value);
                                    setTotalPriceItem(value * (orderDetail?.price || 0));
                                }
                            }}
                        />
                        &nbsp; x &nbsp;
                        {new Intl.NumberFormat().format(orderDetail?.price!)} ₫
                    </div>

                    <div className='modal-card'>
                        Thành tiền: &nbsp;
                        <span style={{ fontSize: '17px' }}>
                            {new Intl.NumberFormat().format(totalPriceItem)} ₫
                        </span>
                    </div>

                    <div className='modal-card'>
                        <div>Ghi chú:</div>
                        <TextArea
                            maxLength={100}
                            style={{ marginTop: '4px' }}
                            placeholder='Tối đa 100 kí tự'
                            autoSize={{ minRows: 2, maxRows: 2 }}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            <InvoiceCard
                open={open}
                setOpen={setOpen}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                currentTable={currentTable}
                setActiveTabKey={setActiveTabKey}
            />
        </Card>
    );
};

export default OrderCard;
