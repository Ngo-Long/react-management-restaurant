import {
    Row,
    Col,
    Card,
    Flex,
    Modal,
    Badge,
    Table,
    Space,
    Avatar,
    Button,
    message,
    Tooltip,
    InputNumber,
    notification,
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    FormOutlined,
    CheckOutlined,
    MinusOutlined,
    AlertOutlined,
    CloseOutlined,
    DollarOutlined,
    HistoryOutlined,
    ScheduleOutlined,
    HourglassOutlined,
    SplitCellsOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';

import InvoiceCard from '../invoice.card';
import { RootState } from '@/redux/store';
import ModalMergeOrder from './container';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/format';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import { orderApi, orderDetailApi } from '@/config/api';
import DropdownMenu from '@/components/share/dropdown.menu';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';
import { IDiningTable, IOrder, IOrderDetail } from '@/types/backend';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';

interface OrderCardProps {
    currentOrder: IOrder | null;
    setCurrentOrder: (order: IOrder | null) => void;
    currentTable: IDiningTable | null;
    setActiveTabKey: (tab: string) => void;
}

type OrderStatus = 'CONFIRMED' | 'PENDING' | 'AWAITING' | 'CANCELED';

const OrderCard: React.FC<OrderCardProps> = ({ currentOrder, setCurrentOrder, currentTable, setActiveTabKey }) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalMerge, setIsModalMerge] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [quantityItem, setQuantityItem] = useState<number>(1);
    const [totalPriceItem, setTotalPriceItem] = useState<number>(0);
    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);

    const meta = useAppSelector(state => state.orderDetail.meta);
    const orderDetails = useSelector((state: RootState) => state.orderDetail?.result);
    const orderSchedules = useSelector((state: RootState) => state.order?.result);

    const sortOrderDetails = (a: IOrderDetail, b: IOrderDetail) => {
        const statusOrder: Record<OrderStatus, number> = { CONFIRMED: 1, PENDING: 2, AWAITING: 3, CANCELED: 4 };
        return statusOrder[a.status as OrderStatus] - statusOrder[b.status as OrderStatus];
    };
    const sortedOrderDetails = [...orderDetails].sort(sortOrderDetails);

    useEffect(() => {
        dispatch(fetchOrderByRestaurant({ query: "filter=status~'RESERVED'&sort=reservationTime,asc" }));
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
        if (orderDetail) {
            setQuantityItem(orderDetail.quantity || 1);
            setTotalPriceItem((orderDetail?.unit?.price || 0) * (orderDetail?.quantity || 1));
        }
    }, [orderDetail]);

    const handleUpdateItem = async () => {
        const res = await orderDetailApi.callUpdate({
            ...orderDetail,
            note: note,
            quantity: quantityItem,
        });

        if (res.data) {
            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id || ''));
            const order = await orderApi.callFetchById(currentOrder?.id || '');
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

    const handleNotificationKitchen = async (currentOrder: IOrder) => {
        try {
            // update order details
            const updateDetails = orderDetails
                .filter(item => item.status === "AWAITING")
                .map(item => ({ ...item, status: "PENDING" }));
            await orderDetailApi.callBatchUpdateStatus(updateDetails);

            // fetch data
            dispatch(fetchOrderDetailsByOrderId(currentOrder?.id!));
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
            width: 160,
            render: (_, record) => (
                <Space>
                    {{
                        CONFIRMED: <CheckOutlined className='btn-icon' />,
                        PENDING: <HourglassOutlined className='btn-icon' />,
                        AWAITING: <EditOutlined className='btn-icon' />,
                        CANCELED: <CloseOutlined className='btn-icon' />
                    }[record.status!] || null}

                    <div className='btn-name'>
                        {`${record.product?.name} (${record.unit?.name})`}
                        {record?.note && (
                            <>
                                <br />
                                {`⤷ ${record.note}`}
                            </>
                        )}
                    </div>
                </Space >
            )
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 50
        },
        {
            title: 'T.Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: 'center',
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
                    {
                        currentOrder
                            ? `Đơn hàng ${currentOrder.id} - ${[...(currentOrder.diningTables || [])]
                                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                .map(table => table.name)
                                .join(', ')
                            }`
                            : `Đơn hàng / ${currentTable?.name}`
                    }
                </div>
            }
        >
            {/* hiện danh sách đơn hàng */}
            <div className="container container-order">
                <div style={{ height: '70%' }}>
                    {orderDetails.length === 0 ? (
                        <div className='order-title'>
                            <svg width="114" height="82" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><title>No data</title><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                            <div style={{ marginTop: '10px' }}> Chưa có món trong đơn.</div>
                            <div> Vui lòng chọn món trong thực đơn.</div>
                        </div>
                    ) : (
                        <Table<IOrderDetail>
                            size='small'
                            columns={columns}
                            pagination={false}
                            dataSource={sortedOrderDetails}
                            className="order-table"
                            rowClassName="order-table-row"
                            rowKey={(record) => record.id || ''}
                            scroll={{ y: 'calc(100vh - 240px)' }}
                            onRow={(record) => ({
                                onClick: () => {
                                    setIsModalOpen(true)
                                    setOrderDetail(record);
                                    setNote(record?.note || '');
                                },
                            })}
                        />
                    )}
                </div>

                <div className='order-content'>
                    {/* <div className='order-area'>
                        <div className='order-note'>
                            Ghi chú
                            <span>&nbsp; (Tối đa 100 kí tự)</span>
                        </div>

                        <TextArea
                            maxLength={100}
                            autoSize={{ minRows: 2, maxRows: 2 }}
                            value={currentOrder?.note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div> */}

                    <div className='order-total'>
                        <Flex gap="small" justify="space-between" align="center">
                            <Tooltip title="Tách/ghép bàn" placement="top" mouseEnterDelay={0.2}>
                                <Avatar
                                    shape="square"
                                    size="default"
                                    className='order-total__tooltip'
                                    icon={<SplitCellsOutlined style={{ color: '#111' }} />}
                                    onClick={() => {
                                        if (currentOrder != null) {
                                            setIsModalMerge(true);
                                        }
                                    }}
                                    style={{
                                        cursor: currentOrder != null ? 'pointer' : 'not-allowed',
                                        opacity: currentOrder != null ? 1 : 0.5,
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title="Phiếu đặt bàn" placement="top" mouseEnterDelay={0.2}>
                                <Badge count={orderSchedules.length} size='small'>
                                    <Avatar
                                        shape="square"
                                        size="default"
                                        className='order-total__tooltip'
                                        icon={<ScheduleOutlined style={{ color: '#111' }} />}
                                    />
                                </Badge>
                            </Tooltip>

                            <Tooltip title="Lịch sử báo bếp" placement="top" mouseEnterDelay={0.2}>
                                <Avatar
                                    shape="square"
                                    size="default"
                                    className='order-total__tooltip'
                                    icon={<HistoryOutlined style={{ color: '#111' }} />}
                                />
                            </Tooltip>

                            <Tooltip title="Ghi chú" placement="top" mouseEnterDelay={0.2}>
                                <Avatar
                                    shape="square"
                                    size="default"
                                    className='order-total__tooltip'
                                    icon={<FormOutlined style={{ color: '#111' }} />}
                                />
                            </Tooltip>
                        </Flex>

                        <Flex gap="middle" justify="space-between" align="center">
                            <Flex gap="small" justify="space-between" align="center" className='order-total__desc'>
                                Tổng tiền
                                <Badge
                                    showZero
                                    color="#fff"
                                    count={currentOrder ? meta.total : 0}
                                    style={{ border: '1px #888888 solid', color: '#212121' }}
                                />
                            </Flex>

                            <div className='order-total__price'>
                                {((currentOrder?.totalPrice ?? 0) + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </div>
                        </Flex>
                    </div>

                    <div className='order-btn'>
                        <Tooltip title="Chuyển món ăn tới bếp" placement="top" mouseEnterDelay={0.5}>
                            <Button
                                danger
                                className='order-btn__alert'
                                disabled={!orderDetails?.some(item => item.status === 'AWAITING')}
                                onClick={() => currentOrder && handleNotificationKitchen(currentOrder)}
                            >
                                <AlertOutlined style={{ fontSize: '18px' }} />  THÔNG BÁO
                            </Button>
                        </Tooltip>

                        <Button
                            className='order-btn__pay btn-green'
                            disabled={!currentOrder}
                            onClick={() => setOpen(true)}
                        >
                            <DollarOutlined style={{ fontSize: '18px' }} /> THANH TOÁN
                        </Button>
                    </div>
                </div>
            </div>

            {/* mở modal thanh toán */}
            <InvoiceCard
                open={open}
                setOpen={setOpen}
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                currentTable={currentTable}
                setActiveTabKey={setActiveTabKey}
            />

            {/* modal tách gộp bàn */}
            <ModalMergeOrder
                isModalMerge={isModalMerge}
                setIsModalMerge={setIsModalMerge}
                currentOrder={currentOrder}
                sortedOrderDetails={sortedOrderDetails}
            />

            {/* modal đặt món ăn cho đơn hàng */}
            <Modal
                title={`
                    ${orderDetail?.product?.name} (${orderDetail?.unit?.name}) -
                    ${new Date(orderDetail?.lastModifiedDate ?? orderDetail?.createdDate ?? '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                `}
                width={400}
                open={isModalOpen}
                className='container-modal'
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    orderDetail?.status === 'AWAITING' && (
                        <Flex gap="middle" justify="space-between">
                            <Button
                                style={{ flex: 1 }}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Đóng
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
                    )
                ]}
            >
                <div className='modal-content'>
                    <Row align="middle" gutter={[6, 6]} className='modal-card'>
                        <Col span={6}>
                            <div className='modal-card__title'>Số lượng:</div>
                        </Col>
                        <Col span={18}>
                            <Flex align="center" gap="small">
                                {orderDetail?.status === 'AWAITING' && (
                                    <Button
                                        size="small"
                                        color="danger"
                                        variant="outlined"
                                        onClick={() => {
                                            const value = quantityItem - 1;
                                            setQuantityItem(value);
                                            setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                        }}
                                    >
                                        <MinusOutlined />
                                    </Button>
                                )}

                                <InputNumber
                                    size="middle"
                                    min={1} max={99}
                                    defaultValue={1}
                                    value={quantityItem}
                                    style={{ width: '60px' }}
                                    disabled={orderDetail?.status !== 'AWAITING'}
                                    onChange={(value: number | null) => {
                                        if (value !== null) {
                                            setQuantityItem(value);
                                            setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                        }
                                    }}
                                />

                                {orderDetail?.status === 'AWAITING' && (
                                    <Button
                                        size="small"
                                        color="danger"
                                        variant="outlined"
                                        onClick={() => {
                                            const value = quantityItem + 1;
                                            setQuantityItem(value);
                                            setTotalPriceItem(value * (orderDetail?.unit?.price || 0));
                                        }}
                                    >
                                        <PlusOutlined />
                                    </Button>)
                                }
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
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Col>
                    </Row>
                </div>
            </Modal>
        </Card>
    );
};

export default OrderCard;
