import {
    AlertOutlined, MenuOutlined,
    DollarOutlined, DeleteOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    UsergroupAddOutlined,
} from '@ant-design/icons';
import {
    Card, Table, Dropdown, Space, Button,
    message, notification, Modal, InputNumber,
    Drawer, Row, Col, Divider,
    Checkbox,
    Radio,
    Flex,
    TimePicker,
    DatePicker
} from 'antd';
import { ColumnType } from 'antd/es/table';
import TextArea from 'antd/es/input/TextArea';

import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IOrder, IOrderDetail } from '@/types/backend';
import { authApi, diningTableApi, invoiceApi, orderApi, orderDetailApi } from '@/config/api';

import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';
import dayjs from 'dayjs';
import { GetProps, Input } from 'antd';
import { ProFormDigit } from '@ant-design/pro-components';

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

interface OrderCardProps {
    currentOrder: IOrder | null;
    setCurrentOrder: (order: IOrder | null) => void;
    currentTable: { id: string | null; name: string | null };
    setActiveTabKey: (tab: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ currentOrder, setCurrentOrder, currentTable, setActiveTabKey }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.orderDetail.meta);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [quantity, setQuantity] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const [open, setOpen] = useState(false);
    const [note, setNote] = useState<string>('');

    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    const [customerPaid, setCustomerPaid] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [methodPaid, setMethodPaid] = useState<string>('CASH');

    useEffect(() => {
        if (currentOrder?.id) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder.id));
        } else {
            dispatch(resetOrderDetails());
        }
    }, [dispatch, currentOrder?.id]);

    useEffect(() => {
        if (orderDetail) {
            setQuantity(orderDetail.quantity || 1);
            setTotalPrice((orderDetail?.price || 0) * (orderDetail?.quantity || 1));
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

    const handleSetCustomerPaid = (amount: number) => {
        setCustomerPaid(amount);
        const total = currentOrder?.totalPrice || 0;
        setReturnAmount(Math.max(0, amount - total));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const showDrawer = () => {
        setOpen(true);
    };

    const cancelDrawer = () => {
        setOpen(false);
    }

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        const res = await orderDetailApi.callUpdate({ ...orderDetail, quantity });
        if (res.data) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id || ''));
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }

        setConfirmLoading(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setConfirmLoading(false);
        }, 500);
    };

    const handleLogout = async () => {
        const res = await authApi.callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/login')
        }
    }

    const onRemoveItem = async (itemId: string) => {
        if (orderDetails.length > 1) {
            // update order detail
            await orderDetailApi.callDelete(itemId);
            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id || ''));

            // update order
            const res = await orderApi.callFetchById(currentOrder?.id!);
            setCurrentOrder(res.data!);
        } else {
            // update order detail
            await orderDetailApi.callDelete(itemId);
            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));

            // update order
            await orderApi.callDelete(currentOrder?.id!);
            setCurrentOrder(null);

            Modal.error({
                title: 'Hủy đơn hàng',
                content: 'Bạn vừa xóa hết món. Đơn hàng này sẽ bị hủy',
            });
        }
    };

    const completedOrder = async (currentOrder: IOrder) => {
        try {
            // update order
            const res = await orderApi.callUpdate({ ...currentOrder, status: 'COMPLETED' });
            if (res.data) {
                setCurrentOrder(res.data);
                dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
                message.success('Bếp đã được nhận thông báo');
            } else {
                notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
            }
        } catch (error: any) {
            notification.error({ message: 'Lỗi kết nối', description: error.message });
        }
    }

    const payOrder = async (currentOrder: IOrder) => {
        if (!currentOrder) return;

        if (customerPaid < currentOrder?.totalPrice!) {
            message.error("Số tiền khách đưa không đủ.");
            return;
        }

        try {
            // create invoice
            const res = await invoiceApi.callCreate({
                totalAmount: currentOrder.totalPrice,
                customerPaid,
                returnAmount,
                method: methodPaid,
                status: 'PAID',
                order: { id: currentOrder.id }
            });

            const resTable = await diningTableApi.callUpdate({ ...currentTable, status: 'AVAILABLE' });

            if (res.data) {
                // info
                cancelDrawer();
                setActiveTabKey('tab1');
                message.success(`Thanh toán hóa đơn [ ${res.data.id} ] thành công `);

                // reset data
                setCurrentOrder(null);
                dispatch(fetchOrderDetailsByOrderId(''));
                dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
            } else {
                notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
            }
        } catch (error: any) {
            notification.error({ message: 'Lỗi kết nối', description: error.message });
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

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'product.name',
            render: (text, record) => (
                <Space>
                    <DeleteOutlined
                        className='btn-delete'
                        onClick={() => onRemoveItem(record.id!)}
                    />
                    {/* <HourglassOutlined style={{ cursor: 'pointer', color: 'green', fontSize: '16px' }} /> */}

                    <div
                        className='btn-name'
                        onClick={() => {
                            showModal();
                            setOrderDetail(record);
                        }}
                    >
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

    const columnsPay: ColumnType<IOrderDetail>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => (index + 1) + (meta.page - 1) * meta.pageSize
        },
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'product.name',
            render: (text, record) => (
                <div
                    className='btn-name'
                    onClick={() => {
                        showModal();
                        setOrderDetail(record);
                    }}
                >
                    {record.product?.name}
                </div>
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
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            align: "center" as const,
            render: (value: any) => (value.toLocaleString())
        },
        {
            title: 'Thành Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 100,
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
                            // showHeader={false}
                            scroll={orderDetails.length > 8 ? { y: 50 * 7 } : undefined}
                            rowKey={(record) => record.id || ''}
                            rowClassName="order-table-row"
                            className="order-table"
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
                            onClick={() => currentOrder && completedOrder(currentOrder)}
                        >
                            THÔNG BÁO
                        </Button>

                        <Button
                            type="primary"
                            className='order-btn__pay'
                            disabled={!currentOrder}
                            onClick={() => showDrawer()}
                            icon={<DollarOutlined style={{ fontSize: '18px' }} />}
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                className='container-modal'
                title={`Cập nhật số lượng: ${orderDetail?.product?.name} [ ${orderDetail?.id} ]`}
                width={400}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                cancelText={'Hủy bỏ'}
                okText={'Cập nhật món ăn'}
                confirmLoading={confirmLoading}
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
                            value={quantity}
                            onChange={(value: number | null) => {
                                if (value !== null) {
                                    setQuantity(value);
                                    setTotalPrice(value * (orderDetail?.price || 0));
                                }
                            }}
                        />
                        &nbsp; x &nbsp;
                        {new Intl.NumberFormat().format(orderDetail?.price!)} ₫
                    </div>

                    <div className='modal-card'>
                        Thành tiền: &nbsp;
                        <span style={{ fontSize: '17px' }}>
                            {new Intl.NumberFormat().format(totalPrice)} ₫
                        </span>
                    </div>

                    <div className='modal-card'>
                        <div>Ghi chú:</div>
                        <TextArea
                            maxLength={100}
                            style={{ marginTop: '4px' }}
                            placeholder='Tối đa 100 kí tự'
                            autoSize={{ minRows: 2, maxRows: 2 }}
                        />
                    </div>
                </div>
            </Modal>

            <Drawer
                open={open}
                width='1050'
                onClose={cancelDrawer}
                className='container-pay'
                title={`Thanh toán - ${currentTable.name} `}
            >
                <Row gutter={40}>
                    <Col span={15}>
                        <div className='pay-search'>
                            <div className='pay-search__card' >
                                <UserOutlined className='' style={{ fontSize: '20px' }} />
                                <div className='pay-search__title'>Khách hàng</div>
                            </div>

                            <Space direction="vertical">
                                <Search
                                    placeholder="Tìm tên hoặc điện thoại khách hàng"
                                    allowClear
                                    style={{ width: 350 }}
                                />
                            </Space>
                        </div>

                        <Table<IOrderDetail>
                            columns={columnsPay}
                            dataSource={orderDetails}
                            pagination={false}
                            size='middle'
                            bordered
                            scroll={orderDetails.length > 10 ? { y: 48 * 10 } : undefined}
                            rowKey={(record) => record.id || ''}
                            rowClassName="order-table-row"
                            className="order-table"
                        />
                    </Col>

                    <Col span={9}>
                        <div className='pay-col' >
                            <p></p>
                            <Space wrap>
                                <DatePicker value={dayjs()} format="DD/MM/YYYY" style={{ width: '120px' }} disabled />
                                <TimePicker value={dayjs()} format="HH:mm" size="middle" style={{ width: '80px' }} disabled />
                            </Space>
                        </div>

                        <div className='pay-col'>
                            <p className='pay-title'>Tổng tiền</p>
                            <p className='pay-price'>
                                {formatPrice(currentOrder?.totalPrice!)}
                            </p>
                        </div>

                        <div className='pay-col'>
                            <p className='pay-title'>Thuế</p>
                            <p className='pay-price'>0</p>
                        </div>

                        <div className='pay-col'>
                            <p className='pay-title'>Giảm giá</p>
                            <p className='pay-price'>0</p>
                        </div>

                        <div className='pay-col'>
                            <p className='pay-title' style={{ fontWeight: '500' }}>Khách cần trả</p>
                            <p className='pay-price' style={{ color: '#f82222', fontSize: '18px' }}>
                                {formatPrice(currentOrder?.totalPrice!)}
                            </p>
                        </div>

                        <Divider style={{ border: '1px solid #ccc', margin: '14px 0' }} />

                        <Flex vertical gap="middle" style={{ marginRight: '-15px', padding: '14px 0' }}>
                            <Radio.Group
                                className='pay-col'
                                options={[
                                    { label: 'Tiền mặt', value: 'CASH' },
                                    { label: 'Thẻ', value: 'CARD' },
                                    { label: 'Chuyển khoản', value: 'TRANSFER' },
                                ]}
                                value={methodPaid}
                                onChange={(e) => setMethodPaid(e.target.value)}
                            />
                        </Flex>

                        <Flex wrap gap="small" className="pay-wrap" style={{ padding: '14px 0' }}>
                            {[0, 20000, 50000, 10000, 200000, 300000, 400000, 500000].map((increment) => (
                                <Button key={increment} onClick={() => handleSetCustomerPaid((currentOrder?.totalPrice || 0) + increment)}>
                                    {formatPrice((currentOrder?.totalPrice || 0) + increment)}
                                </Button>
                            ))}
                        </Flex>

                        <div className='pay-col'>
                            <p className='pay-title'>Khách thanh toán:</p>
                            <input
                                className="pay-price pay-price__input"
                                type="text"
                                value={new Intl.NumberFormat('vi-VN').format(customerPaid)}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\./g, '');
                                    const numericValue = parseFloat(rawValue) || 0;
                                    handleSetCustomerPaid(numericValue);
                                }}
                            />
                        </div>

                        <div className='pay-col'>
                            <p className='pay-title'>Tiền thừa trả khách</p>
                            <p className='pay-price' style={{ color: '#f82222', fontSize: '18px' }}>
                                {formatPrice(returnAmount)}
                            </p>
                        </div>

                        <div className='pay-btn'>
                            <Button danger className='pay-btn__alert' onClick={() => setOpen(false)}>
                                HỦY
                            </Button>

                            <Button
                                danger
                                type="primary"
                                className='pay-btn__pay'
                                disabled={!currentOrder}
                                onClick={() => currentOrder && payOrder(currentOrder)}
                                icon={<DollarOutlined style={{ fontSize: '18px' }} />}
                            >
                                THANH TOÁN
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Drawer>
        </Card>
    );
};

export default OrderCard;
