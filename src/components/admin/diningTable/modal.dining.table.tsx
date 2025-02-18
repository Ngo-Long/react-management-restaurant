
import {
    ModalForm, ProFormDigit,
    ProFormSelect, ProFormSwitch, ProFormText
} from "@ant-design/pro-components";
import { Button, Col, Divider, Form, Input, Row, Space, message, notification, InputRef } from "antd";

import { useEffect, useRef, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { diningTableApi } from "@/config/api";
import { IDiningTable } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";
import { isMobile } from 'react-device-detect';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IDiningTable | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalDiningTable = (props: IProps) => {
    const [form] = Form.useForm();
    const inputRef = useRef<InputRef>(null);
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [locations, setLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState<string>('');
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ dataInit })
        }
    }, [dataInit])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const diningTables = await diningTableApi.callFetchByRestaurant('');
                const uniqueLocations = [...new Set(diningTables.data?.result.map((table: IDiningTable) => table.location))];
                setLocations(uniqueLocations);
            } catch (error) {
                console.error("Lỗi khi fetch dữ liệu bàn ăn:", error);
            }
        };
        fetchData();
    }, []);



    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    // add a new location
    const addLocation = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newLocation && !locations.includes(newLocation)) {
            setLocations([...locations, newLocation]);
            setNewLocation('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const submitDiningTable = async (valuesForm: any) => {
        const { name, location, seats, sequence, status, description, active } = valuesForm;

        const diningTable = {
            id: dataInit?.id,
            name,
            location,
            seats,
            sequence,
            status,
            description,
            active,
            restaurant: {
                id: currentRestaurant.id ?? "",
                name: currentRestaurant.name ?? ""
            }
        };

        const res = dataInit?.id
            ? await diningTableApi.callUpdate(diningTable)
            : await diningTableApi.callCreate(diningTable);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} bàn ăn thành công`);
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitDiningTable}
                initialValues={{
                    ...dataInit,
                    status: dataInit?.id ? dataInit.status : "AVAILABLE",
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            label="Tên bàn ăn"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập bàn ăn"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            label="Số thứ tự"
                            name="sequence"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số thứ tự"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            label="Số ghế"
                            name="seats"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số ghế"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormSelect
                            label="Vị trí"
                            name="location"
                            placeholder="Chọn vị trí"
                            rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                            options={locations.map(location => ({ label: location, value: location }))}
                            fieldProps={{
                                dropdownRender: (menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <Input
                                                placeholder="Thêm vị trí mới"
                                                value={newLocation}
                                                onChange={(e) => setNewLocation(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                ref={inputRef}
                                            />
                                            <Button type="text" icon={<PlusOutlined />} onClick={addLocation}>
                                                Thêm
                                            </Button>
                                        </Space>
                                    </>
                                ),
                            }}
                        />
                    </Col>

                    {false && (
                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="status"
                                label="Trạng thái"
                                valueEnum={{
                                    OCCUPIED: 'Đã có khách',
                                    RESERVED: 'Đã đặt trước',
                                    AVAILABLE: 'Còn trống',
                                }}
                                placeholder="Vui lòng chọn trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            />
                        </Col>
                    )}

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Mô tả"
                            name="description"
                            rules={[{ required: false, message: '' }]}
                            placeholder="Nhập mô tả"
                        />
                    </Col>

                    {dataInit?.id && (
                        <Col span={24} md={12}>
                            <ProFormSwitch
                                label="Hoạt động"
                                name="active"
                                checkedChildren="ACTIVE"
                                unCheckedChildren="INACTIVE"
                                initialValue={true}
                                fieldProps={{
                                    defaultChecked: true,
                                }}
                            />
                        </Col>
                    )}
                </Row>
            </ModalForm >
        </>
    )
}

export default ModalDiningTable;