
import {
    Col, ConfigProvider, Form,
    Row, Upload, message,
    notification, Breadcrumb
} from "antd";
import {
    ProFormSelect, ProForm,
    FooterToolbar, ProFormSwitch, ProFormText,
} from "@ant-design/pro-components";
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import enUS from 'antd/lib/locale/en_US';
import Title from "antd/es/typography/Title";

import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { categoryApi, productApi } from "@/config/api";
import { ICategory, IProduct } from "@/types/backend";
import CategoryCard from "./product.category";
import styles from 'styles/admin.module.scss';
import { useAppSelector } from "@/redux/hooks";
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { beforeUpload, getBase64, handleChange, handleRemoveFile, handleUploadFileLogo } from "@/config/image-upload";

interface IProductLogo {
    name: string | null;
    uid: string;
}

const ViewUpsertProduct = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const productId = new URLSearchParams(location.search)?.get("id");
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const [descProduct, setDescProduct] = useState<String>("");
    const [dataProduct, setDataProduct] = useState<IProduct | null>(null);
    const [categoryList, setCategoryList] = useState<ICategory[]>([]);

    //modal animation
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [dataLogo, setDataLogo] = useState<IProductLogo[]>([]);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            if (!productId) return;
            const res = await productApi.callFetchById(productId);
            if (!res?.data) return;

            // set product
            setDataProduct(res.data);
            setDescProduct(res.data.detailDesc || "");
            form.setFieldsValue(res.data);
            setDataLogo([{ name: res.data.image, uid: uuidv4() }])

            // set category
            const updatedCategories = res.data.categories?.length
                ? await Promise.all(res.data.categories.map(async (category) => {
                    const categoryRes = await categoryApi.callFetchById(category.id);
                    return categoryRes?.data
                        ? {
                            ...categoryRes.data,
                            isDefault: categoryRes.data.default
                        }
                        : {
                            id: category.id,
                            name: category.name,
                            price: category.price,
                            costPrice: 0,
                            default: false,
                            categoryDetails: [],
                            product: { id: productId }
                        };
                }))
                : [{
                    id: uuidv4(),
                    name: "Mặc định",
                    price: 0,
                    costPrice: 0,
                    default: true,
                    categoryDetails: [],
                    product: { id: res.data.id }
                }];

            setCategoryList(updatedCategories);
        }
        init();
        return () => form.resetFields()
    }, [productId])

    const hasIngredients = (category: ICategory) => {
        return category.categoryDetails && category.categoryDetails.length > 0;
    };

    const isValidUuidV4 = (id: string): boolean => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89a-b][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(id);
    };

    const submitProduct = async (valuesForm: any) => {
        if (dataLogo.length === 0) return message.error('Vui lòng tải ảnh lên');

        const hasEmptyCategory = categoryList.some(category => !hasIngredients(category));
        if (hasEmptyCategory) return message.error('Vui lòng chọn nguyên liệu!');

        const { name, category, unit, sold, shortDesc, detailDesc, active } = valuesForm;
        const product = {
            id: dataProduct?.id,
            name,
            category,
            unit,
            sold,
            image: dataLogo[0].name,
            shortDesc,
            detailDesc,
            active,
            categories: [],
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
            }
        };

        const resProduct = dataProduct?.id
            ? await productApi.callUpdate(product)
            : await productApi.callCreate(product);

        console.log(categoryList);

        const results = await Promise.allSettled(
            categoryList.map(async (category) => {
                try {
                    const newCategory = { ...category, product: { id: resProduct.data?.id } };
                    if (newCategory?.id && isValidUuidV4(String(newCategory.id))) {
                        delete newCategory.id;
                    }

                    const resCategory = newCategory.id
                        ? await categoryApi.callUpdate(newCategory)
                        : await categoryApi.callCreate(newCategory);

                    return resCategory.data;
                } catch (error) {
                    console.error("Error creating category:", error);
                    return null;
                }
            })
        );

        const updatedCategories = results
            .filter((result) => result.status === "fulfilled" && result.value !== null)
            .map((result) => (result as PromiseFulfilledResult<any>).value);

        if (resProduct.data && updatedCategories.every(category => category)) {
            message.success(`${dataProduct?.id ? 'Cập nhật' : 'Tạo mới'} hàng hóa và danh mục thành công`);
            navigate('/admin/product');
        } else {
            let errorMessage = "Có lỗi xảy ra";
            if (!resProduct.data) errorMessage = `${resProduct.message || 'Lỗi khi tạo/cập nhật sản phẩm'}`;

            const categoryErrorMessages = updatedCategories.filter(category => !category).map(() => 'Lỗi khi tạo/cập nhật danh mục');
            if (categoryErrorMessages.length > 0) errorMessage += `: ${categoryErrorMessages.join(', ')}`;

            notification.error({ message: 'Có lỗi xảy ra', description: errorMessage, });
        }
    }

    return (
        <div className={styles["upsert-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/product">Thực đơn</Link> },
                        { title: 'Chỉnh sửa món ăn' },
                    ]}
                />
            </div>

            <ConfigProvider locale={enUS}>
                <ProForm
                    form={form}
                    onFinish={submitProduct}
                    submitter={{
                        searchConfig: {
                            resetText: "Hủy",
                            submitText: <>{dataProduct?.id ? "Cập nhật món ăn" : "Thêm món ăn"}</>
                        },
                        onReset: () => navigate('/admin/product'),
                        render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                        submitButtonProps: {
                            icon: <CheckSquareOutlined />
                        },
                    }}
                >
                    <Row gutter={[30, 4]}>
                        <Col span={24}>
                            <Title level={5} style={{ marginTop: '0px' }}>{dataProduct?.id ? "Cập nhật món ăn" : "Thêm món ăn"}</Title>
                        </Col>

                        <Col span={24} md={4}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Chọn ảnh"
                                name="image"
                            >
                                <ConfigProvider locale={enUS}>
                                    <Upload
                                        name="image"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        maxCount={1}
                                        multiple={false}
                                        customRequest={({ file, onSuccess, onError }) => {
                                            handleUploadFileLogo({ file, onSuccess, onError }, setDataLogo);
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
                                            dataProduct?.id
                                                ? [{
                                                    uid: uuidv4(),
                                                    name: dataProduct?.image ?? "",
                                                    status: "done",
                                                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${dataProduct?.image}`,
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

                        <Col span={24} md={20}>
                            <Row gutter={[30, 4]}>
                                <Col span={24} md={12}>
                                    <ProFormText
                                        label="Tên món ăn"
                                        name="name"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                        placeholder="Nhập món ăn"
                                    />
                                </Col>
                                <Col span={24} md={12}>
                                    <ProFormSelect
                                        label="Phân loại"
                                        name="category"
                                        valueEnum={{
                                            FOOD: "Đồ ăn",
                                            DRINK: "Đồ uống",
                                            ORTHER: "Khác",
                                        }}
                                        placeholder="Vui lòng chọn phân loại"
                                        rules={[
                                            { required: true, message: "Vui lòng chọn phân loại!" },
                                        ]}
                                    />
                                </Col>
                                <Col span={24} md={12}>
                                    <ProFormText
                                        label="Đơn vị"
                                        name="unit"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                        placeholder="Nhập đơn vị"
                                    />
                                </Col>
                                <Col span={24} md={12}>
                                    <ProFormText
                                        label="Mô tả"
                                        name="shortDesc"
                                        placeholder="Nhập mô tả"
                                    />
                                </Col>
                                <Col span={24} md={4}>
                                    <ProFormSwitch
                                        label="Hoạt động"
                                        name="active"
                                        checkedChildren="ACTIVE"
                                        unCheckedChildren="INACTIVE"
                                        initialValue={true}
                                        hidden={true}
                                        fieldProps={{ defaultChecked: true }}
                                    />
                                </Col>
                                <Col span={24}>
                                    <ProForm.Item
                                        name="detailDesc"
                                        label="Mô tả chi tiết"
                                        rules={[{ required: false, message: "" }]}
                                    >
                                        <ReactQuill theme="snow" />
                                    </ProForm.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* category card */}
                    <CategoryCard
                        categoryList={categoryList}
                        setCategoryList={setCategoryList}
                    />
                </ProForm>
            </ConfigProvider>
        </div >
    );
}

export default ViewUpsertProduct;