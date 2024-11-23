
import { Col, ConfigProvider, Form, Input, Row, Upload, message, notification } from "antd";
import {
    ProFormSelect, ProFormSwitch, ProFormText,
    FooterToolbar, ModalForm, ProForm, ProFormDigit,
    ProFormTextArea
} from "@ant-design/pro-components";
import 'react-quill/dist/quill.snow.css';

import ReactQuill from 'react-quill';
import { useState, useEffect, useCallback } from 'react';
import { isMobile } from 'react-device-detect';

import { DebounceSelect } from "../user/debouce.select";

import { IProduct } from "@/types/backend";
import { productApi, restaurantApi, callUploadSingleFile } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';


interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IProduct | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IRestaurantSelect {
    label: string;
    value: string;
    key?: string;
}

interface IProductLogo {
    name: string;
    uid: string;
}

const ModalProduct = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [form] = Form.useForm();

    //modal animation
    const [animation, setAnimation] = useState<string>('open');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<IProductLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [restaurants, setRestaurants] = useState<IRestaurantSelect[]>([]);

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

            setDataLogo([{
                name: dataInit.image,
                uid: uuidv4(),
            }])
        }
    }, [dataInit])

    const resetModal = useCallback(() => {
        form.resetFields();
        setDataInit(null);
        setRestaurants([]);
        setOpenModal(false);
        setAnimation('open');
    }, [form, setDataInit, setOpenModal]);

    // const handleReset = async () => {
    //     form.resetFields();
    //     setDataInit(null);

    //     //add animation when closing modal
    //     setAnimation('close')
    //     await new Promise(r => setTimeout(r, 400))

    //     setRestaurants([]);
    //     setOpenModal(false);
    //     setAnimation('open')
    // }

    const handleRemoveFile = (file: any) => {
        setDataLogo([])
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Vui lòng tải ảnh dạng JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Vui lòng tải ảnh không quá 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi tải ảnh!")
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "product");
        if (res && res.data) {
            setDataLogo([{
                name: res.data.fileName,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataLogo([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    const submitProduct = async (valuesForm: any) => {
        const {
            name, sellingPrice, costPrice, category, unit, quantity,
            sold, shortDesc, detailDesc, active, restaurant
        } = valuesForm;

        if (dataLogo.length === 0) {
            message.error('Vui lòng tải ảnh lên')
            return;
        }

        const restaurantValue = isRoleOwner ? restaurant : {
            value: currentRestaurant?.id,
            label: currentRestaurant?.name
        };

        const product = {
            id: dataInit?.id,
            name,
            sellingPrice,
            costPrice,
            category,
            unit,
            quantity,
            sold,
            image: dataLogo[0].name,
            shortDesc,
            detailDesc,
            active,
            restaurant: {
                id: restaurantValue?.value,
                name: restaurantValue?.label
            }
        };

        const res = dataInit?.id
            ? await productApi.callUpdate(product)
            : await productApi.callCreate(product);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} hàng hóa thành công`);
            resetModal();
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
                title={<>{dataInit?.id ? "Cập nhật sản phẩm" : "Tạo mới sản phẩm"}</>}
                open={openModal}
                modalProps={{
                    onCancel: resetModal,
                    afterClose: resetModal,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    className: `modal-product ${animation}`,
                    rootClassName: `modal-product-root ${animation}`
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitProduct}
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    restaurant: isRoleOwner
                        ? { label: dataInit?.restaurant?.name, value: dataInit?.restaurant?.id }
                        : { label: currentRestaurant?.name, value: currentRestaurant?.id }
                } : {}}
                submitter={{
                    render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                    submitButtonProps: {
                        icon: <CheckSquareOutlined />
                    },
                    searchConfig: {
                        resetText: "Hủy",
                        submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    }
                }}

            >
                <Row gutter={[30, 4]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            label="Tên hàng hóa"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập hàng hóa"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            label="Giá vốn"
                            name="costPrice"
                            placeholder="Nhập Giá vốn"
                            fieldProps={{
                                addonAfter: " ₫",
                                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                            }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormSelect
                            label="Loại hàng"
                            name="category"
                            valueEnum={{
                                FOOD: 'Đồ ăn',
                                DRINK: 'Đồ uống',
                                ORTHER: 'Khác',
                            }}
                            placeholder="Vui lòng chọn loại hàng"
                            rules={[{ required: true, message: 'Vui lòng chọn loại hàng!' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            label="Giá bán"
                            name="sellingPrice"
                            placeholder="Nhập Giá bán"
                            fieldProps={{
                                addonAfter: " ₫",
                                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                            }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Đơn vị"
                            name="unit"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập đơn vị"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            label="Tồn kho"
                            name="quantity"
                            placeholder="Nhập số lượng tồn kho"
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
                        <ProFormSwitch
                            label="Hoạt động"
                            name="active"
                            checkedChildren="ACTIVE"
                            unCheckedChildren="INACTIVE"
                            initialValue={true}
                            fieldProps={{ defaultChecked: true }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormTextArea
                            label="Mô tả ngắn"
                            name="shortDesc"
                            placeholder="Nhập loại hàng"
                            fieldProps={{
                                autoSize: { minRows: 4 }
                            }}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Ảnh hàng hóa"
                            name="image"
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
                                    name="image"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={handleUploadFileLogo}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    onRemove={(file) => handleRemoveFile(file)}
                                    onPreview={handlePreview}
                                    defaultFileList={
                                        dataInit?.id
                                            ? [{
                                                uid: uuidv4(),
                                                name: dataInit?.image ?? "",
                                                status: 'done',
                                                url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${dataInit?.image}`,
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

                    <Col span={24}>
                        <ProForm.Item
                            name="detailDesc"
                            label="Mô tả chi tiết"
                            rules={[{ required: false, message: '' }]}
                        >
                            <ReactQuill theme="snow" />
                        </ProForm.Item>
                    </Col>
                </Row>
            </ModalForm >
        </>
    )
}

export default ModalProduct;