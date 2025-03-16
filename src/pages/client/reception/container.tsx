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
import dayjs from 'dayjs';
import ModalClient from '@/components/client/modal.client';

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
    const currentUser = useAppSelector(state => state.account.user);
    const tables = useSelector((state: RootState) => state.diningTable.result);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);
    const [openClientModal, setOpenClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchDiningTableByRestaurant({ query: '' }));
    }, [dispatch]);

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
    }

    const handleClientModalClose = () => {
        setOpenClientModal(false);
        setSelectedClient(null);
    }

    const handleClientSelect = (client: any) => {
        form.setFieldValue('user', client.id);
        setSelectedClient(client);
        handleClientModalClose();
    }

    const submitOrderScheduled = async (valuesForm: IOrder) => {
        try {
            const { user, reservationTime, diningTables, guestCount, note } = valuesForm;

            if (!reservationTime || !diningTables) {
                throw new Error('Missing required fields');
            }

            // Convert to ISO string format for Java Instant parsing
            const isoDateTime = dayjs(reservationTime).toISOString();

            const orderScheduled: IOrder = {
                note,
                guestCount,
                status: 'RESERVED',
                reservationTime: isoDateTime,
                user: {
                    id: typeof user === 'string' ? user : user?.id
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
                            name="user"
                            label="Khách hàng"
                        // rules={[{ required: true, message: "Vui lòng chọn khách" }]}
                        >
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Tìm tên khách hàng"
                                suffixIcon={
                                    <PlusOutlined
                                        style={{ fontSize: 20, color: '#555', cursor: 'pointer' }}
                                        onClick={() => setOpenClientModal(true)}
                                    />
                                }
                                value={selectedClient?.id}
                                disabled
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
                            name="reservationTime"
                            label="Giờ đến"
                            initialValue={dayjs()}
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
                                        showTime={true}
                                        defaultValue={dayjs()}
                                    />
                                    <TimePicker
                                        format="HH:mm"
                                        placeholder="Chọn giờ"
                                        style={{ width: '40%' }}
                                        defaultValue={dayjs()}
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
                reloadTable={() => { }}
            />
        </>
    )
}