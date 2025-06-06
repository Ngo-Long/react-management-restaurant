
import {
    Col,
    Form,
    Row,
    Space,
    Input,
    Upload,
    Button,
    message,
    Divider,
    InputRef,
    Breadcrumb,
    notification,
    ConfigProvider,
} from "antd";
import {
    ProForm,
    ProFormText,
    ProFormSelect,
    FooterToolbar,
    ProFormSwitch,
} from "@ant-design/pro-components";
import {
    PlusOutlined,
    LoadingOutlined,
    CheckSquareOutlined
} from '@ant-design/icons';
import {
    getBase64,
    beforeUpload,
    handleChange,
    handleRemoveFile,
    handleUploadFileLogo
} from "@/utils/image";
import enUS from 'antd/lib/locale/en_US';
import Title from "antd/es/typography/Title";

import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import CategoryCard from "./card.unit";
import 'react-quill/dist/quill.snow.css';
import styles from 'styles/admin.module.scss';
import { IUnit, IProduct } from "@/types/backend";
import { unitApi, productApi } from "@/config/api";
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchProductsByRestaurant } from "@/redux/slice/productSlide";

interface IProductLogo {
    uid: string;
    name: string | null;
}

const ViewUpsertProduct = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    let location = useLocation();
    const productId = new URLSearchParams(location.search)?.get("id");
    const products = useAppSelector(state => state.product.result);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const [descProduct, setDescProduct] = useState<String>("");
    const [dataProduct, setDataProduct] = useState<IProduct | null>(null);
    const [unitList, setUnitList] = useState<IUnit[]>([]);

    // state for slect
    const inputRef = useRef<InputRef>(null);
    const [types, setTypes] = useState<string[]>([]);
    const [newType, setNewType] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState<string>('');
    const [stations, setStations] = useState<string[]>([]);
    const [newStation, setNewStation] = useState<string>('');

    //modal animation
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [dataLogo, setDataLogo] = useState<IProductLogo[]>([
        { name: "", uid: "" }
    ]);

    useEffect(() => {
        if (currentRestaurant?.id) {
            dispatch(fetchProductsByRestaurant({ query: '' }));
        }
    }, [currentRestaurant, dispatch]);

    useEffect(() => {
        // set categories
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        setCategories(uniqueCategories);

        // set types
        const uniqueTypes = [...new Set(products.map(product => product.type))];
        setTypes(uniqueTypes);

        // set stations
        const uniqueStations = [...new Set(products.map(product => product.station))];
        setStations(uniqueStations);
    }, [products]);

    useEffect(() => {
        const init = async () => {
            if (productId) {
                const res = await productApi.callFetchById(productId);
                if (!res?.data) return;

                // Set product data
                setDataProduct(res.data);
                setDescProduct(res.data.detailDesc || "");
                setDataLogo([{ name: res.data.image, uid: uuidv4() }]);
                form.setFieldsValue(res.data);

                // Set unit data
                const updatedUnits = await Promise.all((res.data.units || []).map(async (unit) => {
                    const unitRes = await unitApi.callFetchById(unit.id);
                    return unitRes?.data
                        ? ({
                            id: unitRes.data.id ?? unit.id,
                            name: unitRes.data.name ?? unit.name,
                            price: unitRes.data.price ?? unit.price ?? 0,
                            costPrice: unitRes.data.costPrice ?? 0,
                            default: unitRes.data.default ?? false,
                            active: unitRes.data.active ?? true,
                            unitDetails: unitRes.data.unitDetails ?? [],
                            product: unitRes.data.product ?? { id: productId },
                        } as IUnit)
                        : ({
                            id: unit.id,
                            name: unit.name,
                            price: unit.price ?? 0,
                            costPrice: 0,
                            default: false,
                            active: true,
                            unitDetails: [],
                            product: { id: productId }
                        } as IUnit);
                }))
                setUnitList(updatedUnits);
            } else {
                const defaultUnit = {
                    id: uuidv4(),
                    name: "Mặc định",
                    price: 0,
                    costPrice: 0,
                    default: true,
                    unitDetails: []
                };
                setUnitList([defaultUnit]);
            }
        };

        init();
        return () => form.resetFields();
    }, [productId]);

    // add a new category
    const addCategory = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    // add a new type
    const addType = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newType && !types.includes(newType)) {
            setTypes([...types, newType]);
            setNewCategory('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    // add a new station
    const addStation = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newStation && !stations.includes(newStation)) {
            setStations([...stations, newStation]);
        }
    };

    const hasIngredients = (unit: IUnit) => {
        return unit.unitDetails && unit.unitDetails.length > 0;
    };

    const isValidUuidV4 = (id: string): boolean => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89a-b][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(id);
    };

    const submitProduct = async (valuesForm: any) => {
        const hasEmptyUnit = unitList.some(unit => !hasIngredients(unit));
        if (hasEmptyUnit) return message.error('Vui lòng chọn nguyên liệu!');

        const { name, type, station, category, shortDesc, detailDesc, active } = valuesForm;
        const product = {
            id: dataProduct?.id,
            name,
            type,
            station,
            image: dataLogo[0].name || null,
            category,
            shortDesc,
            detailDesc,
            active,
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
            }
        };

        const resProduct = dataProduct?.id
            ? await productApi.callUpdate(product)
            : await productApi.callCreate(product);

        const results = await Promise.allSettled(
            unitList.map(async (unit) => {
                try {
                    const newUnit = { ...unit, product: { id: resProduct.data?.id } };
                    if (newUnit?.id && isValidUuidV4(String(newUnit.id))) {
                        delete newUnit.id;
                    }

                    const resUnit = newUnit.id
                        ? await unitApi.callUpdate(newUnit)
                        : await unitApi.callCreate(newUnit);

                    return resUnit.data;
                } catch (error) {
                    console.error("Error creating unit:", error);
                    return null;
                }
            })
        );

        const updatedUnits = results
            .filter((result) => result.status === "fulfilled" && result.value !== null)
            .map((result) => (result as PromiseFulfilledResult<any>).value);

        if (resProduct.data && updatedUnits.every(unit => unit)) {
            message.success(`${dataProduct?.id ? 'Cập nhật' : 'Tạo mới'} hàng hóa và danh mục thành công`);
            navigate('/admin/product');
        } else {
            let errorMessage = "Có lỗi xảy ra";
            if (!resProduct.data) errorMessage = `${resProduct.message || 'Lỗi khi tạo/cập nhật sản phẩm'}`;

            const unitErrorMessages = updatedUnits.filter(unit => !unit).map(() => 'Lỗi khi tạo/cập nhật danh mục');
            if (unitErrorMessages.length > 0) errorMessage += `: ${unitErrorMessages.join(', ')}`;

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
                            resetText: "Đóng",
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
                                name="image"
                                label="Chọn ảnh"
                                labelCol={{ span: 24 }}
                            >
                                <ConfigProvider locale={enUS}>
                                    <Upload
                                        name="image"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        maxCount={1}
                                        multiple={false}
                                        customRequest={({ file, onSuccess, onError }) => {
                                            handleUploadFileLogo({ file, onSuccess, onError }, setDataLogo, "product");
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
                                        fileList={
                                            dataProduct?.id && dataProduct?.image
                                                ? [{
                                                    uid: uuidv4(),
                                                    name: dataProduct?.image,
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

                            <ProFormSwitch
                                hidden
                                noStyle
                                label="Hoạt động"
                                name="active"
                                checkedChildren="ACTIVE"
                                unCheckedChildren="INACTIVE"
                                initialValue={true}
                                fieldProps={{ defaultChecked: true }}
                            />
                        </Col>

                        <Col span={24} md={20}>
                            <Row gutter={[30, 4]}>
                                <Col span={24} md={12}>
                                    <ProFormText
                                        label="Tên món ăn"
                                        name="name"
                                        placeholder="Nhập món ăn"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    />
                                </Col>

                                <Col span={24} md={12}>
                                    <ProFormSelect
                                        label="Danh mục"
                                        name="category"
                                        placeholder="Chọn danh mục"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                        options={categories.map(category => ({ label: category, value: category }))}
                                        fieldProps={{
                                            dropdownRender: (menu) => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Space style={{ padding: '0 8px 4px' }}>
                                                        <Input
                                                            placeholder="Thêm danh mục mới"
                                                            value={newCategory}
                                                            onChange={(e) => setNewCategory(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            ref={inputRef}
                                                        />
                                                        <Button type="default" icon={<PlusOutlined />} onClick={addCategory}>
                                                            Thêm
                                                        </Button>
                                                    </Space>
                                                </>
                                            ),
                                        }}
                                    />
                                </Col>

                                <Col span={24} md={12}>
                                    <ProFormSelect
                                        label="Phân loại"
                                        name="type"
                                        placeholder="Chọn phân loại"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                        options={types.map(type => ({ label: type, value: type }))}
                                        fieldProps={{
                                            dropdownRender: (menu) => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Space style={{ padding: '0 8px 4px' }}>
                                                        <Input
                                                            placeholder="Thêm phân loại mới"
                                                            value={newType}
                                                            onChange={(e) => setNewType(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            ref={inputRef}
                                                        />
                                                        <Button type="default" icon={<PlusOutlined />} onClick={addType}>
                                                            Thêm
                                                        </Button>
                                                    </Space>
                                                </>
                                            ),
                                        }}
                                    />
                                </Col>

                                <Col span={24} md={12}>
                                    <ProFormSelect
                                        label="Khu chế biến"
                                        name="station"
                                        placeholder="Chọn khu chế biến"
                                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                        options={stations.map(station => ({ label: station, value: station }))}
                                        fieldProps={{
                                            dropdownRender: (menu) => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Space style={{ padding: '0 8px 4px' }}>
                                                        <Input
                                                            placeholder="Thêm khu chế biến mới"
                                                            value={newStation}
                                                            onChange={(e) => setNewStation(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            ref={inputRef}
                                                        />
                                                        <Button type="default" icon={<PlusOutlined />} onClick={addStation}>
                                                            Thêm
                                                        </Button>
                                                    </Space>
                                                </>
                                            ),
                                        }}
                                    />
                                </Col>

                                {/* <Col span={24} md={12}>
                                    <ProFormText
                                        label="Mô tả"
                                        name="shortDesc"
                                        placeholder="Nhập mô tả"
                                    />
                                </Col> */}

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

                    {/* unit card */}
                    <CategoryCard
                        unitList={unitList}
                        setUnitList={setUnitList}
                    />
                </ProForm>
            </ConfigProvider>
        </div >
    );
}

export default ViewUpsertProduct;