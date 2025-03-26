import {
    Col,
    Row,
    Form,
    Space,
    Button,
    message,
    InputRef,
    notification,
    DatePicker,
    TimePicker,
    ConfigProvider,
    Select,
} from "antd";
import {
    ModalForm,
    ProFormText,
    ProFormDigit,
    ProFormSelect,
    ProFormTextArea,
} from "@ant-design/pro-components";
import { PlusOutlined } from '@ant-design/icons';

import 'react-quill/dist/quill.snow.css';
import { diningTableApi, orderApi } from "@/config/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { isMobile } from 'react-device-detect';
import { IOrder } from "@/types/backend";
import { useEffect, useRef, useState } from 'react';
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import viVN from 'antd/locale/vi_VN';
import dayjs, { Dayjs } from 'dayjs';
import ModalClient from '@/components/client/modal.client';
import { fetchClientByRestaurant } from "@/redux/slice/userSlide";
import { fetchOrderByRestaurant } from "@/redux/slice/orderSlide";

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
}

export const ModalOrderScheduled = (props: IProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const inputRef = useRef<InputRef>(null);
    const { openModal, setOpenModal, reloadTable } = props;

    const [locations, setLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState<string>('');
    const [openClientModal, setOpenClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const currentUser = useAppSelector(state => state.account.user);
    const clients = useSelector((state: RootState) => state.user.result);
    const tables = useSelector((state: RootState) => state.diningTable.result);
    const currentRestaurant = useAppSelector(state => state.account?.user?.restaurant);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());

    useEffect(() => {
        dispatch(fetchClientByRestaurant({ query: '' }));
        dispatch(fetchDiningTableByRestaurant({ query: '' }));
    }, [dispatch]);

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
        setSelectedDate(dayjs());
        setSelectedTime(dayjs());
    }

    const handleClientModalClose = () => {
        setOpenClientModal(false);
        setSelectedClient(null);
    }

    const handleClientSelect = (client: any) => {
        form.setFieldValue('user', client.id);
        setSelectedClient(client);
        handleClientModalClose();
        dispatch(fetchClientByRestaurant({ query: '' }));
    }

    const submitOrderScheduled = async (valuesForm: IOrder) => {
        try {
            const { diningTables, guestCount, note } = valuesForm;
            if (!selectedDate || !selectedTime || !diningTables) {
                throw new Error('Lỗi dữ liệu!');
            }

            // Kết hợp ngày và giờ
            const reservationTime = selectedDate
                .hour(selectedTime.hour())
                .minute(selectedTime.minute())
                .second(0);

            const orderScheduled: IOrder = {
                note,
                guestCount,
                option: 'SCHEDULED',
                status: 'RESERVED',
                reservationTime: reservationTime.toISOString(),
                user: {
                    id: typeof selectedClient === 'string' ? selectedClient : selectedClient?.id
                },
                diningTables: Array.isArray(diningTables) ? diningTables.map((tableId) => {
                    return {
                        id: tableId as string | null,
                        name: null
                    };
                }) : []
            };

            const res = await orderApi.callCreate(orderScheduled);
            if (res.data) {
                message.success('Đặt bàn thành công');
                handleReset();
                dispatch(fetchOrderByRestaurant({ query: "filter=status~'RESERVED'&sort=reservationTime,asc" }));
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
                title='Thêm mới đặt bàn'
                form={form}
                open={openModal}
                preserve={false}
                scrollToFirstError={true}
                onFinish={submitOrderScheduled}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 700,
                    keyboard: false,
                    maskClosable: false,
                    okText: 'Xác nhận',
                    cancelText: 'Hủy'
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <Form.Item
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
                                    label: client.name || client.phoneNumber,
                                }))}
                                onChange={(value) => {
                                    const selected = clients.find((c) => c.id === value);
                                    setSelectedClient(selected);
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Nhân viên"
                            fieldProps={{ value: currentUser?.name, disabled: true }}
                        />
                    </Col>

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
                        <Form.Item
                            label="Giờ đến"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' }
                            ]}
                        >
                            <ConfigProvider locale={viVN}>
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
                            </ConfigProvider>
                        </Form.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormSelect
                            label="Phòng/bàn"
                            name="diningTables"
                            placeholder="Chọn bàn ăn"
                            mode="multiple"
                            rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                            options={tables.map(table => ({
                                value: table.id,
                                label: table.name
                            }))}
                            fieldProps={{
                                onChange: (value) => {
                                    console.log('Selected tables:', value);
                                }
                            }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            name="guestCount"
                            label="Số khách"
                            placeholder="Nhập số khách"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>
                </Row>

                <Col span={24}>
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
                    <Space wrap style={{ marginTop: 8 }}>
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
            </ModalForm >

            <ModalClient
                openModal={openClientModal}
                setOpenModal={handleClientModalClose}
                dataInit={null}
                setDataInit={handleClientSelect}
                reloadTable={() => dispatch(fetchClientByRestaurant({ query: '' }))}
            />
        </>
    )
}