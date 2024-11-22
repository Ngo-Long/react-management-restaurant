import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Input, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { userApi, roleApi, restaurantApi } from "@/config/api";
import { IUser } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IRestaurantSelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const [form] = Form.useForm();
    const [roles, setRoles] = useState<IRestaurantSelect[]>([]);

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

            if (dataInit.role) {
                setRoles([
                    {
                        label: dataInit.role?.name,
                        value: dataInit.role?.id,
                        key: dataInit.role?.id,
                    }
                ])
            }

            form.setFieldsValue({
                ...dataInit,
                role: { label: dataInit.role?.name, value: dataInit.role?.id },
                restaurant: { label: dataInit.restaurant?.name, value: dataInit.restaurant?.id },
            })
        }
    }, [dataInit]);

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setRestaurants([]);
        setRoles([]);
        setOpenModal(false);
    }

    const submitUser = async (valuesForm: any) => {
        const { name, email, password, age, gender, address, role, restaurant } = valuesForm;

        const restaurantValue = isRoleOwner ? restaurant : {
            value: currentRestaurant?.id,
            label: currentRestaurant?.name
        };

        const user = {
            id: dataInit?.id,
            name,
            email,
            password,
            age,
            gender,
            address,
            role: { id: role.value, name: "" },
            restaurant: {
                id: restaurantValue?.value,
                name: restaurantValue?.label
            }
        };

        const res = dataInit?.id
            ? await userApi.callUpdate(user)
            : await userApi.callCreate(user);

        if (res.data) {
            message.success(dataInit?.id ? "Cập nhật người dùng thành công" : "Thêm mới người dùng thành công");
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra!',
                description: res.message
            });
        }
    }

    async function fetchRestaurantList(name: string): Promise<IRestaurantSelect[]> {
        const res = await restaurantApi.callFetchFilter(`page=1&size=100&name=/${name}/i`);
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

    async function fetchRoleList(name: string): Promise<IRestaurantSelect[]> {
        const res = await roleApi.callFetchFilter(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;

            const filteredList = isRoleOwner ? list : list.filter(item => Number(item.id) != 1);

            const temp = filteredList.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                };
            });
            return temp;
        } else {
            return [];
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
                onFinish={submitUser}
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    role: { label: dataInit.role?.name, value: dataInit.role?.id },
                    restaurant: isRoleOwner
                        ? { label: dataInit?.restaurant?.name, value: dataInit?.restaurant?.id }
                        : { label: currentRestaurant?.name, value: currentRestaurant?.id }
                } : {}}

            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            disabled={dataInit?.id ? true : false}
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataInit?.id ? true : false}
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập mật khẩu"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Tên hiển thị"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên hiển thị"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            label="Số tuổi"
                            name="age"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số tuổi"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="gender"
                            label="Giới Tính"
                            valueEnum={{
                                MALE: 'Nam',
                                FEMALE: 'Nữ',
                                OTHER: 'Khác',
                            }}
                            placeholder="Chọn giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        />
                    </Col>

                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="role"
                            label="Vai trò"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}

                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={roles}
                                value={roles}
                                placeholder="Chọn công vai trò"
                                fetchOptions={fetchRoleList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRoles(newValue as IRestaurantSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>

                    {isRoleOwner && (
                        <Col lg={12} md={12} sm={24} xs={24}>
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

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: false, message: '' }]}
                            placeholder="Nhập địa chỉ"
                        />
                    </Col>
                </Row>
            </ModalForm >
        </>
    )
}

export default ModalUser;
