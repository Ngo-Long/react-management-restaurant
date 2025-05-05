import {
    Row,
    Col,
    Form,
    Input,
    Upload,
    message,
    notification,
    ConfigProvider,
} from "antd";
import {
    ProForm,
    DrawerForm,
    ProFormText,
    ProFormSelect,
    FooterToolbar,
    ProFormSwitch,
    ProFormDatePicker,
} from "@ant-design/pro-components";
import {
    beforeUpload, getBase64, handleChange,
    handleRemoveFile, handleUploadFileLogo
} from "@/utils/image";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from "react-quill";
import { IUser } from "@/types/backend";
import enUS from 'antd/lib/locale/en_US';
import { useState, useEffect } from "react";
import { isMobile } from 'react-device-detect';
import { useAppSelector } from "@/redux/hooks";
import { DebounceSelect } from "./debouce.select";
import { userApi, roleApi, restaurantApi } from "@/config/api";
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';

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

interface IUserAvatar {
    name: string | null;
    uid: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();
    const [roles, setRoles] = useState<IRestaurantSelect[]>([]);
    const [restaurants, setRestaurants] = useState<IRestaurantSelect[]>([]);

    const [desc, setDesc] = useState<string>("");
    const [animation, setAnimation] = useState<string>('open');
    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataAvatar, setDataAvatar] = useState<IUserAvatar[]>([
        { name: "", uid: "" }
    ]);

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit.restaurant) {
                setRestaurants([{
                    label: dataInit.restaurant.name || "",
                    value: dataInit.restaurant.id || "",
                    key: dataInit.restaurant.id,
                }])
            }

            if (dataInit.role) {
                setRoles([{
                    label: dataInit.role?.name || "",
                    value: dataInit.role?.id || "",
                    key: dataInit.role?.id,
                }])
            }

            setDesc(dataInit.description || "");
            setDataAvatar([{ name: dataInit.avatar, uid: uuidv4() }]);
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
        const { name, email, gender, address, password, birthDate, phoneNumber, role, restaurant } = valuesForm;

        const restaurantValue = isRoleOwner ? restaurant : {
            value: currentRestaurant?.id,
            label: currentRestaurant?.name
        };
        const formattedBirthDate = birthDate ? moment(birthDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null;

        const user = {
            id: dataInit?.id,
            name,
            email,
            avatar: dataAvatar[0].name || null,
            gender,
            address,
            password,
            birthDate: formattedBirthDate ?? undefined,
            phoneNumber,
            description: desc,
            role: {
                id: role.value,
                name: ""
            },
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
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

    async function fetchRoleList(name: string): Promise<IRestaurantSelect[]> {
        const res = await roleApi.callFetchFilter(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const filteredList = list.filter(item => Number(item.id) !== 1);
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
        <DrawerForm
            form={form}
            open={openModal}
            preserve={false}
            onFinish={submitUser}
            scrollToFirstError={true}
            title={<>{dataInit?.id ? "Cập nhật người dùng" : "Tạo mới người dùng"}</>}
            drawerProps={{
                keyboard: false,
                maskClosable: false,
                destroyOnClose: true,
                onClose: handleReset,
                afterOpenChange: (visible) => {
                    if (!visible) handleReset();
                },
                width: isMobile ? "100%" : 900,
                className: `modal-ingredient ${animation}`,
                rootClassName: `modal-ingredient-root ${animation}`
            }}
            initialValues={dataInit?.id ? {
                ...dataInit,
                role: { label: dataInit.role?.name, value: dataInit.role?.id },
                restaurant: isRoleOwner
                    ? { label: dataInit?.restaurant?.name, value: dataInit?.restaurant?.id }
                    : { label: currentRestaurant?.name, value: currentRestaurant?.id }
            } : {}}
            submitter={{
                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                submitButtonProps: { icon: <CheckSquareOutlined /> },
                searchConfig: {
                    resetText: "Đóng",
                    submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                }
            }}
        >
            <Row gutter={16}>
                <Col span={24} md={4}>
                    <Row gutter={[30, 4]}>
                        <Col span={24}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Chọn Ảnh"
                                name="avatar"
                            >
                                <ConfigProvider locale={enUS}>
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        maxCount={1}
                                        multiple={false}
                                        customRequest={({ file, onSuccess, onError }) => {
                                            handleUploadFileLogo({ file, onSuccess, onError }, setDataAvatar, "user");
                                        }}
                                        beforeUpload={beforeUpload}
                                        onChange={(info) => handleChange(info, setLoadingUpload)}
                                        onRemove={() => handleRemoveFile(setDataAvatar)}
                                        onPreview={(file) => {
                                            const fileUrl = file.url || '';
                                            if (!file.originFileObj) {
                                                setPreviewImage(fileUrl);
                                                setPreviewOpen(true);
                                                setPreviewTitle(file.name || fileUrl.substring(fileUrl.lastIndexOf('/') + 1));
                                                return;
                                            }
                                            getBase64(file.originFileObj, (url: string) => {
                                                setPreviewImage(url);
                                                setPreviewOpen(true);
                                                setPreviewTitle(file.name || fileUrl.substring(fileUrl.lastIndexOf('/') + 1));
                                            });
                                        }}
                                        defaultFileList={
                                            dataInit?.id && dataInit?.avatar
                                                ? [{
                                                    uid: uuidv4(),
                                                    name: dataInit?.avatar,
                                                    status: "done",
                                                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/user/${dataInit?.avatar}`,
                                                }]
                                                : []
                                        }
                                    >
                                        <div>
                                            {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </ConfigProvider>
                            </Form.Item>
                        </Col>

                        <Col span={24} md={24}>
                            <ProFormSwitch
                                // name="active"
                                label="Hoạt động"
                                checkedChildren="ACTIVE"
                                unCheckedChildren="INACTIVE"
                                initialValue={true}
                                fieldProps={{ defaultChecked: true }}
                                hidden
                                noStyle
                            />
                        </Col>
                    </Row>
                </Col>

                <Col span={24} md={20}>
                    <Row gutter={[30, 4]}>
                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="email"
                                label="Email"
                                placeholder="Nhập email"
                                disabled={dataInit?.id ? true : false}
                                rules={[
                                    { required: true, message: 'Vui lòng không bỏ trống' },
                                    { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                                ]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText.Password
                                name="password"
                                label="Mật khẩu"
                                placeholder="Nhập mật khẩu"
                                disabled={dataInit?.id ? true : false}
                                rules={[{ required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="name"
                                label="Tên hiển thị"
                                placeholder="Nhập tên hiển thị"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col lg={6} md={6} sm={12}>
                            <ProFormDatePicker
                                name="birthDate"
                                label="Ngày sinh"
                                placeholder="Chọn ngày sinh"
                                fieldProps={{ format: 'DD/MM/YYYY' }}
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col lg={6} md={6} sm={12}>
                            <ProFormSelect
                                name="gender"
                                label="Giới Tính"
                                valueEnum={{
                                    MALE: 'Nam',
                                    FEMALE: 'Nữ',
                                    OTHER: 'Khác',
                                }}
                                placeholder="Chọn giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProForm.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <DebounceSelect
                                    allowClear
                                    showSearch
                                    value={roles}
                                    defaultValue={roles}
                                    style={{ width: '100%' }}
                                    placeholder="Chọn vai trò"
                                    fetchOptions={fetchRoleList}
                                    onChange={(newValue: any) => {
                                        if (newValue?.length === 0 || newValue?.length === 1) {
                                            setRoles(newValue as IRestaurantSelect[]);
                                        }
                                    }}
                                />
                            </ProForm.Item>
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="phoneNumber"
                                label="Số điện thoại"
                                placeholder="Nhập số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="address"
                                label="Địa chỉ"
                                placeholder="Nhập địa chỉ"
                                rules={[{ required: false, message: '' }]}
                            />
                        </Col>

                        <Col span={24} style={{ "marginBottom": "30px" }}>
                            <ProForm.Item
                                label="Mô tả"
                                rules={[{ required: false, message: '' }]}
                            >
                                <ReactQuill
                                    theme="snow"
                                    value={desc}
                                    onChange={setDesc} />
                            </ProForm.Item>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </DrawerForm>
    )
}

export default ModalUser;
