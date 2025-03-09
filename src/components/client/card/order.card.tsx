import {
    Row,
    Col,
    Card,
    Flex,
    Modal,
    Table,
    Space,
    Button,
    message,
    InputNumber,
    notification,
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined,
    AlertOutlined,
    DollarOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import TextArea from 'antd/es/input/TextArea';

import InvoiceCard from './invoice.card';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { IOrder, IOrderDetail } from '@/types/backend';
import { orderApi, orderDetailApi } from '@/config/api';
import DropdownMenu from '@/components/share/dropdown.menu';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';

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

    const [customerPaid, setCustomerPaid] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [methodPaid, setMethodPaid] = useState<string>('CASH');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [quantityItem, setQuantityItem] = useState<number>(1);
    const [totalPriceItem, setTotalPriceItem] = useState<number>(0);

    const meta = useAppSelector(state => state.orderDetail.meta);
    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    useEffect(() => {
        currentOrder?.id
            ? dispatch(fetchOrderDetailsByOrderId(currentOrder.id))
            : dispatch(resetOrderDetails());
    }, [dispatch, currentOrder?.id]);

    useEffect(() => {
        if (orderDetail) {
            setQuantityItem(orderDetail.quantity || 1);
            setTotalPriceItem((orderDetail?.unit?.price || 0) * (orderDetail?.quantity || 1));
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

    useEffect(() => {
        if (orderDetail) {
            setQuantityItem(orderDetail.quantity || 1);
            setSelectedUnitId(orderDetail.unit?.id || null);
            setTotalPriceItem((orderDetail?.unit?.price || 0) * (orderDetail?.quantity || 1));
        }
    }, [orderDetail]);

    const handleUpdateItem = async () => {
        const res = await orderDetailApi.callUpdate({
            ...orderDetail,
            quantity: quantityItem,
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
        try {
            // update order
            const resOrder = await orderApi.callUpdate({ ...currentOrder, note, status: "COMPLETED" });
            if (!resOrder.data) {
                notification.error({ message: "Có lỗi đơn hàng xảy ra", description: resOrder.message });
                return;
            }

            // update order details
            const awaitingDetails = orderDetails.filter(item => item.status === "AWAITING");
            await Promise.all(
                awaitingDetails.map(async (item) => {
                    await orderDetailApi.callUpdate({ ...item, status: "PENDING" });
                })
            );

            setCurrentOrder(resOrder.data);
            dispatch(fetchDiningTableByRestaurant({ query: "?page=1&size=100" }));
            message.success("Bếp đã được nhận thông báo");
        } catch (error: any) {
            notification.error({ message: "Lỗi hệ thống", description: error.message });
        }
    }

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'unit',
            render: (_, record) => (
                <Space>
                    <EditOutlined className='btn-icon' />
                    <div className='btn-name'>
                        {`${record.unit?.productName} (${record.unit?.name})`}
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
            render: (_, record) => (
                <Space>
                    {formatPrice(record.quantity! * record.unit?.price!)}
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
            extra={<DropdownMenu />}
            title={
                <div style={{ display: "flex", fontSize: '15px' }}>
                    <ShoppingCartOutlined style={{ fontSize: '20px', marginRight: '6px' }} />
                    {currentOrder
                        ? `Đơn hàng ${currentOrder.id} /
                            ${currentOrder?.diningTables!
                            .map(table => table.name)
                            .join(' - ')}`
                        : `Đơn hàng / ${currentTable?.name}`
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
                            <span>&nbsp;({currentOrder ? meta.total : 0} món)</span>
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
                    ${orderDetail?.unit?.productName} (${orderDetail?.unit?.name}) -
                    ${new Date(orderDetail?.createdDate!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                `}
                width={400}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Flex gap="small" wrap justify="space-between">
                        <Button style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>

                        <Button
                            danger type="primary" style={{ flex: 1 }}
                            onClick={() => handleRemoveItem(orderDetail?.id!)}
                        >
                            Xóa
                        </Button>

                        <Button
                            className="btn-green" style={{ flex: 1 }}
                            onClick={handleUpdateItem} disabled={confirmLoading}
                        >
                            Cập nhật
                        </Button>
                    </Flex>
                ]}
            >
                <div className='modal-content'>
                    <Row align="middle" gutter={[6, 6]} className='modal-card'>
                        <Col span={6}>
                            <div className='modal-card__title'>Số lượng:</div>
                        </Col>
                        <Col span={18}>
                            <Flex align="center" gap="small">
                                <Button
                                    size="small" color="danger" variant="outlined"
                                    onClick={() => {
                                        const value = quantityItem - 1;
                                        setQuantityItem(value);
                                        setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                    }}
                                >
                                    <MinusOutlined />
                                </Button>

                                <InputNumber
                                    style={{ width: '60px' }}
                                    min={1} max={99} defaultValue={1}
                                    size="middle" value={quantityItem}
                                    onChange={(value: number | null) => {
                                        if (value !== null) {
                                            setQuantityItem(value);
                                            setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                        }
                                    }}
                                />

                                <Button
                                    size="small" color="danger" variant="outlined"
                                    onClick={() => {
                                        const value = quantityItem + 1;
                                        setQuantityItem(value);
                                        setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                    }}
                                >
                                    <PlusOutlined />
                                </Button>
                            </Flex>
                        </Col>
                    </Row>

                    <Row align="middle" gutter={[6, 6]} className='modal-card'>
                        <Col span={6}>
                            <div className='modal-card__title'>Đơn giá:</div>
                        </Col>
                        <Col span={18} style={{ fontSize: '16px' }}>
                            {formatPrice(orderDetail?.unit?.price!)} ₫
                        </Col>
                    </Row>

                    <Row align="middle" gutter={[6, 6]} className='modal-card'>
                        <Col span={6}>
                            <div className='modal-card__title'>Thành tiền:</div>
                        </Col>
                        <Col span={18} style={{ fontWeight: 500, fontSize: '16px' }}>
                            {formatPrice(totalPriceItem)} ₫
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={24} className='modal-card'>
                            <div className='modal-card__title'>Ghi chú:</div>
                            <TextArea
                                maxLength={100}
                                style={{ marginTop: '4px' }}
                                placeholder='Tối đa 100 kí tự'
                                autoSize={{ minRows: 2, maxRows: 2 }}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Col>
                    </Row>
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
