import {
    Col,
    Row,
    Form,
    Upload,
    message,
    notification,
    ConfigProvider,
} from "antd";
import {
    ModalForm,
    ProFormText,
    ProFormSwitch,
    ProFormTextArea,
} from "@ant-design/pro-components";

import {
    PlusOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import 'react-quill/dist/quill.snow.css';
import { reviewApi } from "@/config/api";
import { IReview } from "@/types/backend";
import { useEffect, useState } from 'react';
import { useAppSelector } from "@/redux/hooks";
import { isMobile } from 'react-device-detect';
import { handleChange, beforeUpload, handleRemoveFile, handleUploadFileLogo, getBase64 } from "@/utils/image";

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IReview | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IReviewImages {
    uid: string;
    name: string | null;
}

export const ModalReview = (props: IProps) => {
    const [form] = Form.useForm();
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const currentUser = useAppSelector(state => state.account.user);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    //modal animation
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [dataImage, setDataImage] = useState<IReviewImages[]>([
        { name: "", uid: "" }
    ]);
    
    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ dataInit })
        }
    }, [dataInit])


    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    const submitReview = async (valuesForm: any) => {
        const { title, description, background_color, active } = valuesForm;

        const review = {
            id: dataInit?.id,
            title,
            description,
            images: dataImage[0].name || "",
            background_color,
            active: true,
            user: {
                id: currentUser.id
            },
            restaurant: {
                id: currentRestaurant.id
            }
        };

        const res = dataInit?.id
            ? await reviewApi.callUpdate(review)
            : await reviewApi.callCreate(review);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} bài đăng thành công`);
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
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 600,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Đóng"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitReview}
                initialValues={{ ...dataInit }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            name="images"
                            label="Chọn Ảnh"
                            labelCol={{ span: 24 }}
                        >
                            <ConfigProvider locale={enUS}>
                                <Upload
                                    name="images"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={({ file, onSuccess, onError }) => {
                                        handleUploadFileLogo({ file, onSuccess, onError }, setDataImage, "review");
                                    }}
                                    beforeUpload={beforeUpload}
                                    onChange={(info) => handleChange(info, setLoadingUpload)}
                                    onRemove={() => handleRemoveFile(setDataImage)}
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
                                                name: dataInit?.images ?? "",
                                                status: "done",
                                                url: `${import.meta.env.VITE_BACKEND_URL}/storage/review/${dataInit?.images}`,
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

                    <Col span={24} md={12}>
                        <ProFormText
                            name="title"
                            label="Tiêu đề"
                            placeholder="Nhập tiêu đề"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            name="background_color"
                            label="Màu"
                            placeholder="Nhập màu"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>
                </Row>

                <Col span={24}>
                    <ProFormTextArea
                        label="Mô tả"
                        name="description"
                        placeholder="Nhập mô tả"
                        rules={[{ required: false, message: '' }]}
                    />
                </Col>
                <Col span={24} md={12}>
                    <ProFormSwitch
                        noStyle
                        label="Hoạt động"
                        name="active"
                        checkedChildren="ACTIVE"
                        unCheckedChildren="INACTIVE"
                        initialValue={true}
                        fieldProps={{ defaultChecked: true }}
                    />
                </Col>
            </ModalForm >
        </>
    )
}
