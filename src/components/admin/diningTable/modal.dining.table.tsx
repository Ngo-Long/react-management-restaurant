
import { Col, Form, Row, message, notification } from "antd";
import {
    ModalForm, ProForm, ProFormDigit,
    ProFormSelect, ProFormSwitch, ProFormText
} from "@ant-design/pro-components";
import 'react-quill/dist/quill.snow.css';

import ReactQuill from 'react-quill';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

import { DebounceSelect } from "../user/debouce.select";

import { IDiningTable } from "@/types/backend";
import { diningTableApi, restaurantApi } from "@/config/api";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IDiningTable | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IRestaurantSelect {
    label: string;
    value: string;
    key?: string;
}

const ModalDiningTable = (props: IProps) => {
    const [form] = Form.useForm();
    const [restaurants, setRestaurants] = useState<IRestaurantSelect[]>([]);
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit.restaurant) {
                setRestaurants([{
                    label: dataInit.restaurant.name,
                    value: dataInit.restaurant.id,
                    key: dataInit.restaurant.id,
                }])
            }

            form.setFieldsValue({
                ...dataInit,
                restaurant: { label: dataInit.restaurant?.name, value: dataInit.restaurant?.id },
            })
        }
    }, [dataInit])

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setRestaurants([]);
        setOpenModal(false);
    }

    const submitDiningTable = async (valuesForm: any) => {
        if (dataInit?.id) {
            //update
            const diningTable = {
                id: dataInit.id,
                name: valuesForm.name,
                location: valuesForm.location,
                seats: valuesForm.seats,
                status: valuesForm.status,
                description: valuesForm.description,
                active: valuesForm.active,
                restaurant: {
                    id: valuesForm.restaurant.value,
                    name: valuesForm.restaurant.label
                }
            }

            const res = await diningTableApi.callUpdate(diningTable);
            if (res.data) {
                message.success("Cập nhật bàn ăn thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const diningTable = {
                name: valuesForm.name,
                location: valuesForm.location,
                seats: valuesForm.seats,
                status: valuesForm.status,
                description: valuesForm.description,
                active: valuesForm.active,
                restaurant: {
                    id: valuesForm.restaurant.value,
                    name: valuesForm.restaurant.label
                }
            }

            const res = await diningTableApi.callCreate(diningTable);
            if (res.data) {
                message.success("Tạo mới bàn ăn thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    // Usage of DebounceSelect
    async function fetchRestaurantList(name: string): Promise<IRestaurantSelect[]> {
        const res = await restaurantApi.callFetchFilter(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
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
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    restaurant: { label: dataInit.restaurant?.name, value: dataInit.restaurant?.id },
                } : {}}

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
                            label="Số ghế"
                            name="seats"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số ghế"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Vị trí"
                            name="location"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập vị trí"
                        />
                    </Col>

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

                    <Col span={24} md={12}>
                        <ProForm.Item
                            label="Thuộc nhà hàng"
                            name="restaurant"
                            rules={[{ required: true, message: 'Vui lòng chọn nhà hàng!' }]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={restaurants}
                                value={restaurants}
                                placeholder="Chọn nhà hàng"
                                fetchOptions={fetchRestaurantList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRestaurants(newValue as IRestaurantSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Mô tả"
                            name="description"
                            rules={[{ required: false, message: '' }]}
                            placeholder=""
                        />
                    </Col>

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

                </Row>
            </ModalForm >
        </>
    )
}

export default ModalDiningTable;