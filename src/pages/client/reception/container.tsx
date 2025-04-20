import {
    Col,
    Row,
    Form,
    Space,
    Select,
    Button,
    message,
    DatePicker,
    TimePicker,
    notification,
} from "antd";
import {
    ModalForm,
    ProFormText,
    ProFormDigit,
    ProFormSelect,
    ProFormTextArea,
} from "@ant-design/pro-components";
import { PlusOutlined } from '@ant-design/icons';

import dayjs, { Dayjs } from 'dayjs';
import { orderApi } from "@/config/api";
import { IOrder } from "@/types/backend";
import 'react-quill/dist/quill.snow.css';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { isMobile } from 'react-device-detect';
import React, { useEffect, useState } from 'react';
import { OrderStatus } from "@/utils/statusConfig";
import ModalClient from '@/components/client/modal.client';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchClientsByRestaurant } from "@/redux/slice/clientSlide";
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    fetchData: () => void;
    selectedOrder?: IOrder | null;
    setSelectedOrder: (v: any) => void;
    handleUpdateStatus: (order: IOrder, status: OrderStatus) => Promise<void>;
}

export const ModalOrderScheduled = ({
    openModal,
    setOpenModal,
    reloadTable,
    fetchData,
    selectedOrder,
    setSelectedOrder,
    handleUpdateStatus
}: IProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [openClientModal, setOpenClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any | null>();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs().add(30, 'minute'));
    const currentUser = useAppSelector(state => state?.account.user);
    const clients = useSelector((state: RootState) => state?.client.result);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const tables = useAppSelector(state => state?.diningTable.result).filter(table => table.name!.toLowerCase() !== "mang về");

    useEffect(() => {
        fetchInitialData();
    }, [dispatch, selectedOrder]);

    const fetchInitialData = async () => {
        await dispatch(fetchClientsByRestaurant({ query: 'sort=createdDate,desc' }));
        await dispatch(fetchDiningTableByRestaurant({ query: 'page=1&size=100&sort=sequence,asc&filter=active=true' }));

        if (selectedOrder?.id) {
            const reservationTime = dayjs(selectedOrder!.reservationTime);
            setSelectedDate(reservationTime);
            setSelectedTime(reservationTime);

            // Tìm client trong danh sách đã load
            const client = clients.find(c => c.id === selectedOrder.client?.id) || selectedOrder.client;
            form.setFieldsValue({
                ...selectedOrder,
                client: client?.id,
                diningTables: selectedOrder.diningTables?.map(table => table.id)
            });

        }
    }

    const handleReset = async () => {
        form.resetFields();
        setSelectedOrder(null);
        setOpenModal(false);
        setSelectedDate(dayjs());
        setSelectedTime(dayjs().add(30, 'minute'));
        setSelectedClient(null);
    }

    const handleClientModalClose = () => {
        setOpenClientModal(false);
        setSelectedClient(null);
    }

    const handleTableChange = (selectedTableIds: string[]) => {
        // Tính tổng số chỗ ngồi từ các bàn đã chọn
        const totalSeats = selectedTableIds.reduce((sum, id) => {
            const table = tables.find(t => t.id === id);
            return sum + (table?.seats || 0);
        }, 0);

        // Cập nhật giá trị số khách trong form
        form.setFieldsValue({
            guestCount: totalSeats
        });

        // Lưu danh sách tên bàn đã chọn (nếu cần hiển thị)
        const names = selectedTableIds.map(id => {
            const table = tables.find(t => t.id === id);
            return table?.name || '';
        }).filter(name => name !== '');

        setSelectedTables(names);
    };

    const submitOrderScheduled = async (valuesForm: IOrder) => {
        try {
            const { diningTables, guestCount, note } = valuesForm;

            const clientId = form.getFieldValue('client');
            if (!clientId) throw new Error('Vui lòng chọn khách hàng');

            const reservationTime = selectedDate
                .hour(selectedTime.hour())
                .minute(selectedTime.minute())
                .second(0);

            const minAllowedTime = dayjs().add(15, 'minute');
            if (reservationTime.isBefore(minAllowedTime)) {
                throw new Error('Thời gian đặt bàn phải sau thời gian hiện tại ít nhất 15 phút');
            }

            const tables = diningTables === undefined ? [] : diningTables;
            const status = tables.length > 0 ? OrderStatus.RESERVED : OrderStatus.WAITING;

            const orderScheduled: IOrder = {
                id: selectedOrder?.id,
                note,
                guestCount,
                option: 'SCHEDULED',
                status,
                reservationTime: reservationTime.toISOString(),
                client: {
                    id: clientId
                },
                diningTables: (tables as string[]).map(tableId => ({
                    id: tableId
                }))
            };

            const res = selectedOrder?.id
                ? await orderApi.callUpdate(orderScheduled)
                : await orderApi.callCreate(orderScheduled);

            if (res.data) {
                message.success(selectedOrder?.id ? "Cập nhật lịch đặt thành công" : "Thêm mới lịch đặt thành công");
                handleReset();
                fetchData();
                reloadTable();
            }
        } catch (error: any) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message
            });
        }
    }

    return (
        <>
            <ModalForm
                title={<>{selectedOrder?.id ? "Cập nhật lịch đặt" : "Tạo mới lịch đặt"}</>}
                form={form}
                open={openModal}
                preserve={false}
                scrollToFirstError={true}
                initialValues={{ ...selectedOrder }}
                onFinish={submitOrderScheduled}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 700,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{selectedOrder?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: 'Hủy'
                }}
                submitter={{
                    render: (props, defaultDoms) => {
                        if (selectedOrder?.status === OrderStatus.CANCELED) return null;
                        const [cancelBtn, submitBtn] = defaultDoms;
                        const buttonStyle = { minWidth: 80 };

                        return (
                            <Space size="middle">
                                {React.cloneElement(
                                    cancelBtn,
                                    {
                                        key: 'cancel',
                                        style: buttonStyle
                                    }
                                )}

                                {selectedOrder?.id && selectedOrder.status !== OrderStatus.PENDING && (
                                    <Button
                                        danger
                                        type="primary"
                                        style={buttonStyle}
                                        onClick={() => {
                                            handleReset();
                                            handleUpdateStatus(selectedOrder!, OrderStatus.DELETE)
                                        }}
                                    >
                                        Xóa
                                    </Button>
                                )}

                                {selectedOrder?.id && (
                                    <Button
                                        danger
                                        type="primary"
                                        style={buttonStyle}
                                        onClick={() => {
                                            handleReset();
                                            handleUpdateStatus(selectedOrder, OrderStatus.CANCELED)
                                        }}
                                    >
                                        Hủy đặt
                                    </Button>
                                )}

                                {(
                                    !selectedOrder ||
                                    (selectedOrder.id && selectedOrder.status !== OrderStatus.PENDING)
                                ) &&
                                    React.cloneElement(
                                        submitBtn,
                                        {
                                            key: 'submit',
                                            style: buttonStyle
                                        }
                                    )
                                }

                                {selectedOrder?.status === OrderStatus.RESERVED && (
                                    <Button
                                        type="primary"
                                        style={buttonStyle}
                                        onClick={() => {
                                            handleReset();
                                            handleUpdateStatus(selectedOrder, OrderStatus.PENDING)
                                        }}
                                    >
                                        Nhận bàn
                                    </Button>
                                )}
                            </Space>
                        );
                    }
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            name="id"
                            label="Mã đặt bàn"
                            fieldProps={{
                                disabled: true,
                                placeholder: "Mã tự động"
                            }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Nhân viên"
                            fieldProps={{ value: currentUser?.name, disabled: true }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            name="client"
                            label="Khách hàng"
                            rules={[{ required: true, message: "Vui lòng chọn khách" }]}
                        >
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Tìm tên hoặc số điện thoại khách hàng"
                                suffixIcon={
                                    <PlusOutlined
                                        style={{ fontSize: 20, color: '#555', cursor: 'pointer' }}
                                        onClick={() => setOpenClientModal(true)}
                                    />
                                }
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={clients.map((client) => ({
                                    value: client.id,
                                    label: `${client.name} (${client.phoneNumber})`,
                                }))}
                                listHeight={150}
                                value={selectedClient ? selectedClient.id : undefined}
                                onChange={(value) => {
                                    const selected = clients.find((c) => c.id === value);
                                    setSelectedClient(selected);
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label="Giờ đến"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Space.Compact block>
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    placeholder="Chọn ngày"
                                    style={{ width: '70%' }}
                                    disabledDate={(current) => {
                                        return current && current < dayjs().startOf('day');
                                    }}
                                    value={selectedDate}
                                    onChange={(date) => date && setSelectedDate(date)}
                                />
                                <TimePicker
                                    format="HH:mm"
                                    placeholder="Chọn giờ"
                                    style={{ width: '40%' }}
                                    value={selectedTime}
                                    onChange={(time) => time && setSelectedTime(time)}
                                />
                            </Space.Compact>
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormSelect
                            name="diningTables"
                            label="Phòng/bàn"
                            mode="multiple"
                            placeholder="Chờ xếp bàn"
                            fieldProps={{
                                listHeight: 150,
                                onChange: handleTableChange
                            }}
                            options={tables.map(table => ({
                                value: table.id,
                                label: table.name
                            }))}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            name="guestCount"
                            label="Số khách"
                            placeholder="Nhập số khách"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            fieldProps={{
                                onChange: (value) => {
                                    form.setFieldsValue({ guestCount: value });
                                }
                            }}
                        />
                    </Col>

                    <Col span={24} style={{ marginBottom: '14px' }}>
                        <ProFormTextArea
                            label="Ghi chú"
                            name="note"
                            placeholder="Nhập ghi chú"
                            fieldProps={{
                                maxLength: 200,
                                showCount: true,
                                autoSize: { minRows: 2, maxRows: 4 }
                            }}
                        />
                        <Space wrap>
                            {['Có trẻ em', 'Cần bàn riêng', 'Sinh nhật', 'Kỷ niệm', 'Hội họp', 'Khách VIP'].map(text => (
                                <Button
                                    key={text}
                                    size="small"
                                    onClick={() => {
                                        const note = form.getFieldValue('note');
                                        form.setFieldValue('note', note ? `${note}, ${text}` : text);
                                    }}
                                >
                                    {text}
                                </Button>
                            ))}
                        </Space>
                    </Col>
                </Row>
            </ModalForm >

            <ModalClient
                openModal={openClientModal}
                setOpenModal={handleClientModalClose}
                dataInit={selectedClient}
                setDataInit={(client) => {
                    setSelectedClient(client);
                    form.setFieldsValue({ client: client.id });
                }}
                reloadTable={() => dispatch(fetchClientsByRestaurant({ query: 'sort=createdDate,desc' }))}
            />
        </>
    )
}
