import {
    Row,
    Col,
    Form,
    Upload,
    message,
    notification,
    ConfigProvider,
} from "antd";
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProFormDatePicker,
} from "@ant-design/pro-components";
import {
    PlusOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import enUS from 'antd/lib/locale/en_US';

import {
    beforeUpload, getBase64, handleChange,
    handleRemoveFile, handleUploadFileLogo
} from "@/utils/image";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import { clientApi } from "@/config/api";
import { IClient } from "@/types/backend";
import { useState, useEffect } from "react";
import { isMobile } from 'react-device-detect';
import { useAppSelector } from "@/redux/hooks";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IClient | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IRestaurantSelect {
    label: string;
    value: string;
    key?: string;
}

interface IClientAvatar {
    name: string | null;
    uid: string;
}

const ModalClient = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();
    const [desc, setDesc] = useState<string>("");
    const currentRestaurant = useAppSelector(state => state.account?.user?.restaurant);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataAvatar, setDataAvatar] = useState<IClientAvatar[]>([
        { name: "", uid: "" }
    ]);

    useEffect(() => {
        if (dataInit?.id) {
            setDesc(dataInit.description || "");
            setDataAvatar([{ name: dataInit.avatar, uid: uuidv4() }]);
        }
    }, [dataInit]);

    const submitClient = async (valuesForm: any) => {
        const { name, email, gender, address, password, birthDate, phoneNumber } = valuesForm;
        const formattedBirthDate = birthDate ? moment(birthDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null;

        const client = {
            id: dataInit?.id,
            name,
            email,
            avatar: dataAvatar[0].name || null,
            gender,
            address,
            birthDate: formattedBirthDate ?? undefined,
            phoneNumber,
            active: true,
            description: desc,
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
            }
        };

        const res = dataInit?.id
            ? await clientApi.callUpdate(client)
            : await clientApi.callCreate(client);

        if (res.data) {
            message.success(dataInit?.id ? "Cập nhật khách hàng thành công" : "Thêm mới khách hàng thành công");
            setDataInit(res.data);
            reloadTable();
            setOpenModal(false);
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
            onFinish={submitClient}
            scrollToFirstError={true}
            title={<>{dataInit?.id ? "Cập nhật khách hàng" : "Tạo mới khách hàng"}</>}
            initialValues={{ dataInit }}
            modalProps={{
                onCancel: () => setOpenModal(false),
                afterClose: () => setOpenModal(false),
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
                                fieldProps={{ format: 'DD/MM/YYYY' }}
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
