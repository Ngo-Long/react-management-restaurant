import {
    Col,
    Row,
    Flex,
    Radio,
    Space,
    Table,
    Drawer,
    Button,
    Divider,
    message,
    DatePicker,
    TimePicker,
    notification,
} from "antd";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import { UserOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import '@/styles/client.table.scss';
import html2canvas from 'html2canvas';
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { invoiceApi } from "@/config/api";
import { formatPrice } from "@/utils/format";
import { IOrder, IOrderDetail } from "@/types/backend";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrderDetailsByOrderId } from "@/redux/slice/orderDetailSlide";
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";

interface InvoiceCardProps {
    open: boolean;
    setOpen: (is: boolean) => void;
    currentOrder: IOrder | null;
    setCurrentOrder: (order: IOrder | null) => void;
    currentTable: { id: string | null; name: string | null };
    setActiveTabKey: (tab: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
    open,
    setOpen,
    currentOrder,
    setCurrentOrder,
    currentTable,
    setActiveTabKey
}) => {
    const dispatch = useAppDispatch();
    const invoiceRef = useRef<HTMLDivElement | null>(null);
    const meta = useAppSelector(state => state.orderDetail.meta);

    const [customerPaid, setCustomerPaid] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [methodPaid, setMethodPaid] = useState<string>('CASH');
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);

    const handleSetCustomerPaid = (amount: number) => {
        setCustomerPaid(amount);
        const total = currentOrder?.totalPrice || 0;
        setReturnAmount(Math.max(0, amount - total));
    };

    const handleCreateInvoice = async (currentOrder: IOrder) => {
        if (!currentOrder) return;

        if (customerPaid < currentOrder?.totalPrice!) {
            message.error("Số tiền khách đưa không đủ");
            return;
        }

        // create invoice
        const res = await invoiceApi.callCreate({
            totalAmount: currentOrder.totalPrice,
            customerPaid,
            returnAmount,
            method: methodPaid,
            status: 'PAID',
            order: { id: currentOrder.id }
        });

        if (res.data) {
            // info
            setOpen(false)
            setActiveTabKey('tab1');
            message.success(`Thanh toán hóa đơn [ ${res.data.id} ] thành công `);

            // reset data
            setReturnAmount(0);
            setCustomerPaid(0);
            setCurrentOrder(null);
            dispatch(fetchOrderDetailsByOrderId(''));
            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
        } else {
            notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
        }
    }

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: '#',
            key: 'index',
            width: 40,
            align: "center",
            render: (_, record, index) => (index + 1) + (meta.page - 1) * meta.pageSize
        },
        {
            title: 'Tên món ăn',
            key: 'name',
            render: (_, record) => (
                <div className='btn-name'>
                    {`${record.product?.name} (${record.unit?.name})`}
                </div>
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
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: 'center',
            render: (_, record) => {
                return formatPrice(record.unit?.price);
            }
        },
        {
            title: 'Thành Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: 'center',
            render: (_, record) => {
                const price = record.unit?.price;
                const total = record.quantity! * Number(price);
                return (
                    <Space> {formatPrice(total)} </Space>
                );
            }
        }
    ];

    const handlePrintInvoice = async () => {
        if (!currentOrder) return;

        if (invoiceRef.current) {
            try {
                const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                const doc = new jsPDF();
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                doc.save(`invoice_${currentOrder.id}.pdf`);
            } catch (error) {
                message.error('Không thể in hóa đơn, vui lòng thử lại!');
            }
        } else {
            message.error('Không tìm thấy hóa đơn để in!');
        }
    };

    return (
        <Drawer
            open={open}
            width='950'
            className='container-invoice'
            onClose={() => setOpen(false)}
            title={`Thanh toán - ${currentTable.name} `}
        >
            <Row gutter={40}>
                <Col span={14}>
                    <div>
                        <div className='invoice-search'>
                            <div className='invoice-search__card' >
                                <UserOutlined style={{ fontSize: '20px' }} />
                                <div className='invoice-search__title'>Khách hàng</div>
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
                            bordered
                            size='middle'
                            columns={columns}
                            pagination={false}
                            className="order-table"
                            dataSource={orderDetails}
                            rowClassName="order-table-row"
                            rowKey={(record) => record.id || ''}
                            scroll={{ y: 'calc(100vh - 200px)' }}
                        />
                    </div>

                    <div ref={invoiceRef} className="invoice-container">
                        <div className="invoice-header">
                            <h2 className="invoice-header__heading" >QUẢN LÝ NHÀ HÀNG</h2>
                            <div>Web: https://quanlynhahang.com.vn</div>
                            <div>Địa chỉ: Công viên phần mềm Quang Trung</div>

                            <Divider style={{ borderColor: '#ff4d4f', }}>
                                <div className="invoice-header__title">Hóa Đơn Thanh Toán</div>
                            </Divider>
                        </div>

                        <div className="invoice-content">
                            <div className="invoice-content__left">
                                <p className="invoice-content__title">Mã hóa đơn: {currentOrder?.id}</p>
                                <p className="invoice-content__title">Phục vụ: {currentOrder?.createdBy}</p>
                                <p className="invoice-content__title">Giờ vào: {dayjs().format(' HH:mm:ss DD/MM/YYYY')}</p>
                            </div>

                            <div className="invoice-content__right">
                                <p className="invoice-content__title">Bàn ăn: {currentTable.name}</p>
                                <p className="invoice-content__title">Thu ngân: {currentOrder?.createdBy}</p>
                                <p className="invoice-content__title">Giờ ra: {dayjs().format('HH:mm:ss DD/MM/YYYY')}</p>
                            </div>
                        </div>

                        <Divider style={{ border: '1px solid #ffa8a9', margin: '14px 0' }} />
                        <Table<IOrderDetail>
                            columns={columns.map(column => ({
                                ...column,
                                onCell: () => ({ style: { fontSize: '16px' } })
                            }))}
                            dataSource={orderDetails}
                            pagination={false}
                            size="small"
                            bordered
                        />

                        <Divider style={{ border: '1px solid #ffa8a9', margin: '14px 0' }} />
                        <div className='invoice-row'>
                            <div className='invoice-col'>
                                <div className='invoice-title m4'>Tổng tiền:</div>
                                <div className='invoice-price m4'>
                                    {formatPrice(currentOrder?.totalPrice)}
                                </div>
                            </div>

                            <div className='invoice-col'>
                                <div className='invoice-title m4'>Thuế:</div>
                                <div className='invoice-price m4'>0</div>
                            </div>

                            <div className='invoice-col'>
                                <p className='invoice-title m4'>Giảm giá:</p>
                                <p className='invoice-price m4'>0</p>
                            </div>

                            <div className='invoice-col'>
                                <p className='invoice-title m4' style={{ fontWeight: '500' }}>Tổng thanh toán:</p>
                                <p className='invoice-price invoice-price__bold m4'>
                                    {formatPrice(currentOrder?.totalPrice)}
                                </p>
                            </div>
                        </div>

                        <Divider style={{ border: '1px solid #ffa8a9', margin: '14px 0' }} />
                        <div style={{ textAlign: 'center' }}>Trân trọng cảm ơn quý khách!</div>
                    </div>
                </Col>

                <Col span={10}>
                    <div className='invoice-col' >
                        <p></p>
                        <Space wrap>
                            <DatePicker value={dayjs()} format="DD/MM/YYYY" style={{ width: '120px' }} />
                            <TimePicker value={dayjs()} format="HH:mm" size="middle" style={{ width: '80px' }} />
                        </Space>
                    </div>

                    <div className='invoice-col'>
                        <p className='invoice-title'>Tổng tiền</p>
                        <p className='invoice-price'>
                            {formatPrice(currentOrder?.totalPrice)}
                        </p>
                    </div>

                    <div className='invoice-col'>
                        <p className='invoice-title'>Thuế</p>
                        <p className='invoice-price'>0</p>
                    </div>

                    <div className='invoice-col'>
                        <p className='invoice-title'>Giảm giá</p>
                        <p className='invoice-price'>0</p>
                    </div>

                    <div className='invoice-col'>
                        <p className='invoice-title invoice-title__bold'>Khách cần trả</p>
                        <p className='invoice-price  invoice-price__bold m4'>
                            {formatPrice(currentOrder?.totalPrice)}
                        </p>
                    </div>

                    <Divider style={{ border: '1px solid #ccc', margin: '14px 0' }} />

                    <Flex vertical gap="middle" style={{ marginRight: '-15px', padding: '14px 0' }}>
                        <Radio.Group
                            className='invoice-col'
                            options={[
                                { label: 'Tiền mặt', value: 'CASH' },
                                { label: 'Thẻ', value: 'CARD' },
                                { label: 'Chuyển khoản', value: 'TRANSFER' },
                            ]}
                            value={methodPaid}
                            onChange={(e) => setMethodPaid(e.target.value)}
                        />
                    </Flex>

                    <Flex wrap gap="small" className="invoice-wrap" style={{ padding: '14px 0' }}>
                        {[(currentOrder?.totalPrice || 0), 50000, 100000, 200000, 300000, 400000, 500000, 1000000].map((increment) => (
                            <Button
                                key={increment}
                                onClick={() => handleSetCustomerPaid(increment)}
                            >
                                {formatPrice(increment)}
                            </Button>
                        ))}
                    </Flex>

                    <div className='invoice-col'>
                        <p className='invoice-title'>Khách thanh toán:</p>
                        <input
                            className="invoice-price invoice-price__input"
                            type="text"
                            value={formatPrice(customerPaid)}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\./g, '');
                                const numericValue = parseFloat(rawValue) || 0;
                                handleSetCustomerPaid(numericValue);
                            }}
                        />
                    </div>

                    <div className='invoice-col'>
                        <p className='invoice-title'>Tiền thừa trả khách</p>
                        <p className='invoice-price' style={{ color: '#f82222', fontSize: '18px' }}>
                            {formatPrice(returnAmount)}
                        </p>
                    </div>

                    <div className='invoice-btn'>
                        <Button danger className='invoice-btn__alert' onClick={handlePrintInvoice}>
                            IN HÓA ĐƠN
                        </Button>

                        <Button
                            className='invoice-btn__pay btn-green'
                            disabled={!currentOrder}
                            onClick={() => currentOrder && handleCreateInvoice(currentOrder)}
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </Col>
            </Row>
        </Drawer >
    )
}

export default InvoiceCard;