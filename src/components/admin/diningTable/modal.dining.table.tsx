
import { Col, Form, Input, Row, message, notification } from "antd";
import {
    ModalForm, ProForm, ProFormDigit,
    ProFormSelect, ProFormSwitch, ProFormText
} from "@ant-design/pro-components";
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import { IDiningTable } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";
import { isMobile } from 'react-device-detect';
import { DebounceSelect } from "../user/debouce.select";
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

    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

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
        const { name, location, seats, status, description, active, restaurant } = valuesForm;

        const restaurantValue = isRoleOwner ? restaurant : {
            value: currentRestaurant?.id,
            label: currentRestaurant?.name
        };

        const diningTable = {
            id: dataInit?.id,
            name,
            location,
            seats,
            status,
            description,
            active,
            restaurant: {
                id: restaurantValue?.value,
                name: restaurantValue?.label
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
                    restaurant: isRoleOwner
                        ? { label: dataInit?.restaurant?.name, value: dataInit?.restaurant?.id }
                        : { label: currentRestaurant?.name, value: currentRestaurant?.id }
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

                    {isRoleOwner && (
                        <Col span={24} md={12}>
                            <ProForm.Item
                                label="Thuộc nhà hàng"
                                name="restaurant"
                                rules={[{ required: true, message: 'Vui lòng chọn nhà hàng!' }]}
                            >
                                {isRoleOwner ? (
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
                                ) : (
                                    <>
                                        <Input value={currentRestaurant?.name || "Không có nhà hàng"} disabled />
                                        <ProFormText
                                            hidden
                                            name="restaurant"
                                            initialValue={{
                                                label: currentRestaurant?.name,
                                                value: currentRestaurant?.id,
                                            }}
                                        />
                                    </>
                                )}
                            </ProForm.Item>
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