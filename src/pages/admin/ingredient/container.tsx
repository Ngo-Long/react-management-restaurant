
import {
    Col,
    Row,
    Form,
    Input,
    Space,
    Button,
    Upload,
    message,
    Divider,
    InputRef,
    notification,
    ConfigProvider,
} from "antd";
import {
    getBase64,
    beforeUpload,
    handleChange,
    handleRemoveFile,
    handleUploadFileLogo
} from "@/utils/image";
import {
    PlusOutlined,
    LoadingOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import {
    ProForm,
    ProTable,
    ModalForm,
    DrawerForm,
    ProFormText,
    ProFormDigit,
    FooterToolbar,
    ProFormSelect,
    ProFormSwitch,
    ProFormUploadDragger,
} from "@ant-design/pro-components";
import enUS from 'antd/lib/locale/en_US';

import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ingredientApi } from "@/config/api";
import { IIngredient } from "@/types/backend";
import { isMobile } from 'react-device-detect';
import { handleImportXlsx } from "@/utils/file";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchIngredientByRestaurant } from "@/redux/slice/ingredientSlide";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IIngredient | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IIngredientLogo {
    name: string;
    uid: string;
}

export const ModalIngredient = (props: IProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const inputRef = useRef<InputRef>(null);
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [desc, setDesc] = useState<string>("");
    const [types, setTypes] = useState<string[]>([]);
    const [newType, setNewType] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState<string>('');
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [animation, setAnimation] = useState<string>('open');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<IIngredientLogo[]>([
        { name: "", uid: "" }
    ]);

    useEffect(() => {
        if (currentRestaurant?.id) {
            dispatch(fetchIngredientByRestaurant({ query: '' }));
        }
    }, [currentRestaurant, dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ingredients = await ingredientApi.callFetchByRestaurant('');

                // set categories
                const uniqueCategories = [...new Set(ingredients.data?.result.map((ingredient: IIngredient) => ingredient.category))];
                setCategories(uniqueCategories);

                // set types
                const uniqueTypes = [...new Set(ingredients.data?.result.map((ingredient: IIngredient) => ingredient.type))];
                setTypes(uniqueTypes);
            } catch (error) {
                console.error("Lỗi khi fetch dữ liệu bàn ăn:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ ...dataInit })
            setDataLogo([{
                name: dataInit.image,
                uid: uuidv4(),
            }])
        }
    }, [dataInit])

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

    const resetModal = useCallback(() => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
        setAnimation('open');
    }, [form, setDataInit, setOpenModal]);

    const submitIngredient = async (valuesForm: any) => {
        const {
            name, type, price, category, status,
            initialQuantity, minimumQuantity, active
        } = valuesForm;

        if (dataLogo.length === 0) {
            message.error('Vui lòng tải ảnh lên')
            return;
        }

        const ingredient = {
            id: dataInit?.id,
            name,
            type,
            price,
            category,
            status,
            image: dataLogo[0].name,
            initialQuantity,
            minimumQuantity,
            description: desc,
            active,
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
            }
        };

        const res = dataInit?.id
            ? await ingredientApi.callUpdate(ingredient)
            : await ingredientApi.callCreate(ingredient);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} nguyên liệu thành công`);
            resetModal();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    }

    return (
        <DrawerForm
            form={form}
            open={openModal}
            preserve={false}
            scrollToFirstError={true}
            onFinish={submitIngredient}
            initialValues={dataInit?.id ? { ...dataInit } : {}}
            title={dataInit?.id ? "Cập nhật nguyên liệu" : "Tạo mới nguyên liệu"}
            drawerProps={{
                onClose: resetModal,
                afterOpenChange: (visible) => {
                    if (!visible) resetModal();
                },
                destroyOnClose: true,
                width: isMobile ? "100%" : 900,
                keyboard: false,
                maskClosable: false,
                className: `modal-ingredient ${animation}`,
                rootClassName: `modal-ingredient-root ${animation}`
            }}
            submitter={{
                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                submitButtonProps: { icon: <CheckSquareOutlined /> },
                searchConfig: {
                    resetText: "Hủy",
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
                                            dataInit?.id
                                                ? [{
                                                    uid: uuidv4(),
                                                    name: dataInit?.image ?? "",
                                                    status: "done",
                                                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/restaurant/${dataInit?.image}`,
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
                        <Col span={24} md={12}>
                            <ProFormText
                                name="name"
                                label="Tên nguyên liệu"
                                placeholder="Nhập nguyên liệu"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            />
                        </Col>

                        <Col span={24} md={12}>
                            <ProFormDigit
                                name="price"
                                label="Giá nhập"
                                placeholder="Nhập giá nhập"
                                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                fieldProps={{
                                    addonAfter: " ₫",
                                    formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                    parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                }}
                            />
                        </Col>

                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="type"
                                label="Phân loại"
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
                                    )
                                }}
                            />
                        </Col>

                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="category"
                                label="Danh mục"
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
                            <ProFormDigit
                                name="initialQuantity"
                                label="Số lượng hiện tại"
                                placeholder="Nhập số lượng hiện tại"
                            />
                        </Col>

                        <Col span={24} md={12}>
                            <ProFormDigit
                                name="minimumQuantity"
                                label="Số lượng tối thiểu"
                                placeholder="Nhập số lượng tối thiểu"
                            />
                        </Col>

                        <Col span={24} style={{ "marginBottom": "30px" }}>
                            <ProForm.Item
                                name="description"
                                label="Mô tả chi tiết"
                                rules={[{ required: false, message: '' }]}
                            >
                                <ReactQuill theme="snow" />
                            </ProForm.Item>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </DrawerForm >
    )
}

declare type IBatchImportBatchImport = {
    open: boolean;
    onOpen: (open: boolean) => void;
    loading?: boolean;
    onLoading?: (loading: boolean) => void;
    reloadTable: () => void;
    onSubmit: (values: any) => void;
}

export const ModalBatchImport = (props: IBatchImportBatchImport) => {
    const { open, onOpen, loading = false, onLoading, reloadTable, onSubmit } = props;
    const [dataImported, setDataImported] = useState<IIngredient[]>([]);

    const onFinish = async (values: any) => {
        if (dataImported.length === 0) {
            message.error("Vui lòng chọn file");
            return;
        }

        onLoading && onLoading(true);
        onSubmit(dataImported);
        setDataImported([]);
    }

    return (
        <ModalForm<IIngredient>
            title="Nhập nguyên liệu"
            open={open}
            modalProps={{
                onCancel: () => onOpen(false),
                afterClose: () => onOpen(false),
                destroyOnClose: true,
                width: isMobile ? "100%" : 600,
                keyboard: false,
                maskClosable: false,
                okText: 'Xác nhận',
                cancelText: "Hủy"
            }}
            onFinish={onFinish}
        >
            <ProFormUploadDragger
                max={1}
                name="Nhập nguyên liệu"
                title="Kéo & thả"
                label="Tải file (Nếu trùng tên nguyên liệu thì không nhập)"
                tooltip={`Nếu trùng tên nguyên liệu thì không nhập`}
                description="Chỉ hỗ trợ file .xlsx, tải lên tối đa 1 file"
                fieldProps={{
                    beforeUpload: async (file) => {
                        const isExcel =
                            file.type === 'application/vnd.ms-excel' ||
                            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        if (!isExcel) {
                            message.error("Chỉ hỗ trợ file excel .xlsx");
                            return;
                        }

                        try {
                            const data = await handleImportXlsx(file);
                            if (data.length > 100) {
                                message.error("File không được quá 100 dòng");
                                return false;
                            }
                            setDataImported(data);
                        } catch (error) {
                            message.error("Lỗi file");
                        }
                        return false;
                    },
                    onRemove: () => {
                        setDataImported([]);
                    }
                }}
            />

            <ProTable<IIngredient>
                search={false}
                options={false}
                dataSource={dataImported}
                pagination={{
                    pageSize: 5,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trên tổng ${total}`
                }}
                locale={{
                    emptyText: (
                        <div style={{ textAlign: "center" }}>
                            <div>Không có dữ liệu</div>
                        </div>
                    )
                }}
                columns={[
                    {
                        key: 'name',
                        dataIndex: 'name',
                        title: 'Tên nguyên liệu'
                    },
                    {
                        key: 'type',
                        dataIndex: 'type',
                        title: 'Phân loại'
                    },
                    {
                        key: 'category',
                        dataIndex: 'category',
                        title: 'Danh mục'
                    },
                    {
                        align: "center",
                        key: 'price',
                        dataIndex: 'price',
                        title: 'Giá vốn',
                        render(_, entity) {
                            const str = "" + entity.price;
                            return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
                        },
                    },
                    {
                        align: "center",
                        key: 'initialQuantity',
                        dataIndex: 'initialQuantity',
                        title: 'SL hiện tại',
                        render(_, entity) {
                            const str = "" + entity.initialQuantity;
                            return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
                        },
                    },
                    {
                        align: "center",
                        key: 'minimumQuantity',
                        dataIndex: 'minimumQuantity',
                        title: 'SL tối thiểu',
                        render(_, entity) {
                            const str = "" + entity.minimumQuantity;
                            return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
                        },
                    }
                ]}
            />
        </ModalForm>
    );
};