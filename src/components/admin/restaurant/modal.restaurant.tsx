import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from "react";
import { restaurantApi, callUploadSingleFile } from "@/config/api";
import { IRestaurant } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import { beforeUpload, getBase64, handleChange, handleRemoveFile, handleUploadFileLogo } from "@/utils/image";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IRestaurant | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IRestaurantForm {
    name: string;
    address: string;
}

interface IRestaurantLogo {
    name: string;
    uid: string;
}

const ModalRestaurant = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    //modal animation
    const [form] = Form.useForm();
    const [value, setValue] = useState<string>("");
    const [animation, setAnimation] = useState<string>('open');

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<IRestaurantLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        if (dataInit?.id && dataInit?.description) {
            setValue(dataInit.description);

            form.setFieldsValue({
                name: dataInit.name,
                address: dataInit.address,
            })

            setDataLogo([{
                name: dataInit.logo,
                uid: uuidv4(),
            }])
        }
    }, [dataInit])

    const handleReset = async () => {
        form.resetFields();
        setValue("");
        setDataInit(null);

        //add animation when closing modal
        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    }

    const submitRestaurant = async (valuesForm: IRestaurantForm) => {
        const { name, address } = valuesForm;

        if (dataLogo.length === 0) {
            message.error('Vui lòng tải ảnh!')
            return;
        }

        if (dataInit?.id) {
            //update
            const res = await restaurantApi.callUpdate({
                id: dataInit.id,
                name,
                address,
                description: value,
                logo: dataLogo[0].name
            });
            if (res.data) {
                message.success("Cập nhật nhà hàng thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        } else {
            //create
            const res = await restaurantApi.callCreate({
                name,
                address,
                description: value,
                logo: dataLogo[0].name
            });
            if (res.data) {
                message.success("Thêm mới nhà hàng thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    return (
        <>
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật nhà hàng" : "Tạo mới nhà hàng"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-restaurant ${animation}`,
                            rootClassName: `modal-restaurant-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitRestaurant}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            },
                            searchConfig: {
                                resetText: "Đóng",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên nhà hàng"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên nhà hàng"
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[{
                                        required: true,
                                        message: 'Vui lòng không bỏ trống',
                                        validator: () => {
                                            if (dataLogo.length > 0) return Promise.resolve();
                                            else return Promise.reject(false);
                                        }
                                    }]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={({ file, onSuccess, onError }) => {
                                                handleUploadFileLogo({ file, onSuccess, onError }, setDataLogo, 'restaurant');
                                            }}
                                            beforeUpload={beforeUpload}
                                            onChange={(info) => handleChange(info, setLoadingUpload)}
                                            onRemove={() => handleRemoveFile(setDataLogo)}
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
                                                dataInit?.id && dataInit?.logo
                                                    ? [{
                                                        uid: uuidv4(),
                                                        name: dataInit?.logo,
                                                        status: 'done',
                                                        url: `${import.meta.env.VITE_BACKEND_URL}/storage/restaurant/${dataInit?.logo}`,
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

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập địa chỉ nhà hàng"
                                    fieldProps={{
                                        autoSize: { minRows: 4 }
                                    }}
                                />
                            </Col>

                            <ProCard
                                size="small"
                                title="Miêu tả"
                                bordered
                                headerBordered
                                // subTitle="mô tả nhà hàng"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                            >
                                <Col span={24}>
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </Col>
                            </ProCard>
                        </Row>
                    </ModalForm>
                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalRestaurant;