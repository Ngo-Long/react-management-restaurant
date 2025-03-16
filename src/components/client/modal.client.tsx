import {
    Row,
    Col,
    Form,
    Input,
    message,
    notification,
    ConfigProvider,
    Upload
} from "antd";
import {
    ProForm,
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    DrawerForm,
    FooterToolbar,
    ProFormSwitch,
    ProFormDatePicker,
    ModalForm,
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
import viVN from 'antd/es/date-picker/locale/vi_VN';
import { userApi, roleApi, restaurantApi } from "@/config/api";
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { DebounceSelect } from "../admin/user/debouce.select";

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

const ModalClient = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();
    const [roles, setRoles] = useState<IRestaurantSelect[]>([]);

    const [desc, setDesc] = useState<string>("");
    const [animation, setAnimation] = useState<string>('open');
    const currentUser = useAppSelector(state => state.account?.user);
    const currentRestaurant = useAppSelector(state => state.account?.user?.restaurant);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataAvatar, setDataAvatar] = useState<IUserAvatar[]>([
        { name: "", uid: "" }
    ]);

    useEffect(() => {
        if (dataInit?.id) {
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
        setRoles([]);
        setOpenModal(false);
    }

    const submitUser = async (valuesForm: any) => {
        const { name, email, gender, address, password, birthDate, phoneNumber, role, restaurant } = valuesForm;
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
        console.log(user);
        const res = dataInit?.id
            ? await userApi.callUpdate(user)
            : await userApi.callCreate(user);

        if (res.data) {
            message.success(dataInit?.id ? "Cập nhật khách hàng thành công" : "Thêm mới khách hàng thành công");
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra!',
                description: res.message
            });
        }
    }

    return (
        <ModalForm
            form={form}
            open={openModal}
            preserve={false}
            onFinish={submitUser}
            scrollToFirstError={true}
            title={<>{dataInit?.id ? "Cập nhật khách hàng" : "Tạo mới khách hàng"}</>}
            initialValues={{ dataInit }}
            modalProps={{
                onCancel: () => handleReset(),
                afterClose: () => handleReset(),
                destroyOnClose: true,
                width: isMobile ? "100%" : 700,
                keyboard: false,
                maskClosable: false,
                okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                cancelText: "Hủy"
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
                                            handleUploadFileLogo({ file, onSuccess, onError }, setDataAvatar);
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
                                            dataInit?.id
                                                ? [{
                                                    uid: uuidv4(),
                                                    name: dataInit?.avatar ?? "",
                                                    status: "done",
                                                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/restaurant/${dataInit?.avatar}`,
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
                                name="active"
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
                                name="name"
                                label="Tên khách hàng"
                                placeholder="Nhập tên khách hàng"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="phoneNumber"
                                label="Số điện thoại"
                                placeholder="Nhập số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormText
                                name="email"
                                label="Email"
                                placeholder="Nhập email"
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormDatePicker
                                name="birthDate"
                                label="Ngày sinh"
                                placeholder="Chọn ngày sinh"
                                fieldProps={{ format: 'DD/MM/YYYY', locale: viVN }}
                            />
                        </Col>

                        <Col lg={12} md={12} sm={24}>
                            <ProFormSelect
                                name="gender"
                                label="Giới Tính"
                                valueEnum={{
                                    MALE: 'Nam',
                                    FEMALE: 'Nữ',
                                    OTHER: 'Khác',
                                }}
                                placeholder="Chọn giới tính"
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
                    </Row>
                </Col>
            </Row>
        </ModalForm>
    )
}

export default ModalClient;
