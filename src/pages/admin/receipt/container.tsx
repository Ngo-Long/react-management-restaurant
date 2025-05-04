import {
    Col,
    Row,
    Card,
    Form,
    Flex,
    Input,
    Badge,
    Space,
    Table,
    Select,
    Button,
    Divider,
    message,
    Checkbox,
    Breadcrumb,
    DatePicker,
    TimePicker,
    InputNumber,
    notification,
    Modal,
} from "antd";
import {
    PlusOutlined,
    FormOutlined,
    DiffOutlined,
    MinusOutlined,
    SearchOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import {
    ProForm,
    ProFormText,
    FooterToolbar,
    ProFormSelect,
    ModalForm,
    ProFormTextArea,
    ProFormSwitch,
} from "@ant-design/pro-components";
import { ColumnType } from "antd/es/table";

import dayjs from 'dayjs';
import { receiptApi } from "@/config/api";
import '../../../styles/client.table.scss';
import { formatPrice } from "@/utils/format";
import styles from 'styles/admin.module.scss';
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IIngredient, IReceipt, IReceiptDetail } from "@/types/backend";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserByRestaurant } from "@/redux/slice/userSlide";
import { fetchSupplierByRestaurant } from "@/redux/slice/supplierSlide";
import { fetchIngredientByRestaurant } from "@/redux/slice/ingredientSlide";

export const ViewUpsertReceipt = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const invoiceRef = useRef<HTMLDivElement | null>(null);
        const [searchText, setSearchText] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState<IReceiptDetail[]>([]);

    const users = useAppSelector(state => state.user.result);
    const currentUser = useAppSelector(state => state.account.user);
    const suppliers = useAppSelector(state => state.supplier.result);
    const ingredients = useAppSelector(state => state.ingredient.result);

    useEffect(() => {
        fetch();
    }, [dispatch]);

    const fetch = () => {
        dispatch(fetchUserByRestaurant({ query: '?page=1&size=100' }));
        dispatch(fetchSupplierByRestaurant({ query: '?page=1&size=100' }));
        dispatch(fetchIngredientByRestaurant({ query: '?page=1&size=100' }));
    };


    const handleIngredientSelection = (ingredient: IIngredient, checked: boolean) => {
        if (checked) {
            setSelectedIngredients(prev => [
                ...prev, 
                { ...ingredient, quantity: 1, discount: 0 }
            ]);
        } else {
            setSelectedIngredients(prev => 
                prev.filter(item => item.id !== ingredient.id)
            );
        }
    };

    const handleQuantityChange = (id: string, value: number) => {
        const newQuantity = Math.max(1, Math.min(99, value));
        setSelectedIngredients(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleDiscountChange = (id: string, value: number) => {
        const newDiscount = Math.max(0, Math.min(99, value));
        setSelectedIngredients(prev =>
            prev.map(item =>
                item.id === id ? { ...item, discount: newDiscount } : item
            )
        );
    };

    const calculateTotal = () => {
        return selectedIngredients.reduce((total, item) => {
            const itemTotal = item?.price! * item.quantity!;
            const itemDiscount = itemTotal * (item.discount! / 100);
            return total + (itemTotal - itemDiscount);
        }, 0);
    };

    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient?.name!.toLowerCase().includes(searchText.toLowerCase())
    );

    const submitReceipt = async (valuesForm: any) => {
        const { type, note, discount, status, supplierId } = valuesForm;

        const receiptDetails = selectedIngredients.map(item => ({
            ingredient: { id: item.id },
            price: item.price,
            quantity: item.quantity,
            discount: item.discount
        }));

        const totalAmount = calculateTotal() - (discount || 0);

        // create invoice
        const receiptData = {
            type,
            note,
            discount: discount || 0,
            totalAmount,
            status,
            supplier: { id: supplierId },
            receiptDetails
        };

        const res = await receiptApi.callCreate(receiptData);
        if (res.data) {
            message.success(`Tạo phiếu [ ${res.data.id} ] thành công `);
            navigate('/admin/receipt');
        } else {
            notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
        }
    }

    const columns: ColumnType<IIngredient>[] = [
        {
            key: "id",
            title: "Chọn",
            width: 60,
            align: "center",
            render: (_, record) => (
                <Checkbox
                    checked={selectedIngredients.some(item => item.id === record.id)}
                    onChange={(e) => handleIngredientSelection(record, e.target.checked)}
                />
            )
        },
        {
            key: "name",
            dataIndex: "name",
            title: "Tên nguyên liệu",
            width: 300,
        },
        {
            key: "quantity",
            title: "Số lượng",
            width: 168,
            align: "center",
            render: (_, record) => {
                const selected = selectedIngredients.find(item => item.id === record.id);
                if (!selected) return null;
                
                return (
                    <Flex align="center" justify="space-between" style={{ width: '150px' }}>
                        <Button
                            size="small" 
                            color="danger" 
                            variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, selected.quantity! - 1)}
                        >
                            <MinusOutlined />
                        </Button>

                        <InputNumber
                            min={1} 
                            max={99}
                            value={selected.quantity}
                            controls={false}
                            onChange={(value) => handleQuantityChange(record.id!, value || 1)}
                            style={{ width: '70px', margin: '0 6px' }}
                        />

                        <Button
                            size="small" 
                            color="danger" 
                            variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, selected.quantity! + 1)}
                        >
                            <PlusOutlined />
                        </Button>
                    </Flex>
                );
            },
        },
        {
            key: 'price',
            dataIndex: 'price',
            title: 'Đơn giá',
            align: "center",
            render: (price) => formatPrice(price)
        },
        {
            key: "discount",
            title: "Giảm giá (%)",
            align: "center",
            render: (_, record) => {
                const selected = selectedIngredients.find(item => item.id === record.id);
                if (!selected) return null;
                
                return (
                    <InputNumber
                        min={0}
                        max={99}
                        value={selected.discount}
                        formatter={value => `${value}%`}
                        // parser={value => value!.replace('%', '')}
                        onChange={(value) => handleDiscountChange(record.id!, value || 0)}
                        style={{ width: '80px' }}
                    />
                );
            },
        },
        {
            key: 'total',
            title: 'Thành tiền',
            align: "center",
            render: (_, record) => {
                const selected = selectedIngredients.find(item => item.id === record.id);
                if (!selected) return null;
                
                const itemTotal = selected.price! * selected.quantity!;
                const discountAmount = itemTotal * (selected.discount! / 100);
                return formatPrice(itemTotal - discountAmount);
            },
        },
    ];

    return (
        <div className="container-invoice">
            <div className={styles["upsert-container"]}>
                <Breadcrumb
                    items={[
                        { title: <Link to="/admin/receipt">Biên lai</Link> },
                        { title: 'Tạo phiếu' },
                    ]}
                    separator=">"
                    className={styles["title"]}
                />

                <ProForm
                    form={form}
                    onFinish={submitReceipt}
                    submitter={{
                        searchConfig: {
                            resetText: "Đóng",
                            submitText: "Tạo biên lai"
                        },
                        onReset: () => navigate('/admin/receipt'),
                        render: (_: any, dom: any) => (<FooterToolbar> {dom} </FooterToolbar>),
                        submitButtonProps: {
                            icon: <CheckSquareOutlined />
                        },
                    }}
                >
                    <Card
                        title={
                            <Flex justify="space-between" align="center">
                                <Flex align="center" gap="small">
                                    <FormOutlined /> Thành phần
                                </Flex>

                                <Space wrap>
                                    <DatePicker value={dayjs()} format="DD/MM/YYYY" style={{ width: "120px" }} />
                                    <TimePicker value={dayjs()} format="HH:mm" size="middle" style={{ width: "80px" }} />
                                </Space>
                            </Flex>
                        }
                    >
                        <Row gutter={[30, 4]}>
                            <Col span={24} md={12}>
                                <Form.Item label="Nhân viên">
                                    <Select
                                        defaultValue={currentUser.name}
                                        placeholder="Chọn nhân viên"
                                        options={users.map(user => ({
                                            value: user.id,
                                            label: user.name
                                        }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormText
                                    name="id"
                                    label="Mã phiếu"
                                    placeholder="Mã phiếu tự động"
                                    fieldProps={{ disabled: true }}
                                />
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormSelect
                                    label="Loại phiếu"
                                    name="type"
                                    placeholder="Chọn loại phiếu"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    options={[
                                        { label: "Phiếu nhập", value: "IN" },
                                        { label: "Phiếu trả", value: "OUT" },
                                        { label: "Phiếu tạm", value: "TEMPORARY" },
                                    ]}
                                />
                            </Col>
                    
                            <Col span={24} md={12}>
                                <ProFormSelect
                                    name="supplierId"
                                    label="Nhà cung cấp"
                                    placeholder="Chọn nhà cung cấp"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    options={suppliers.map(supplier => ({
                                        value: supplier.id,
                                        label: supplier.name
                                    }))}
                                />
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormSelect
                                    name="status"
                                    label="Trạng thái"
                                    placeholder="Chọn thanh toán"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    options={[
                                        { label: "Thanh toán ngay", value: "PAID" },
                                        { label: "Chưa thanh toán", value: "UNPAID" },
                                    ]}
                                />
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormText
                                    name="note"
                                    label="Ghi chú"
                                    placeholder="Nhập ghi chú"
                                />
                            </Col>

                            <Col span={24}>
                                <Divider style={{ border: '1px solid #ededed', margin: '14px 0' }} />
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormText
                                    name="discount"
                                    label="Giảm giá"
                                    placeholder="Nhập số tiền giảm giá"
                                />
                            </Col>

                            <Col span={24} md={12}>
                                <ProFormText
                                    label={
                                        <>
                                            Tổng tiền
                                            <Badge count={selectedIngredients.length} showZero style={{ marginLeft: '6px' }} />
                                        </>
                                    }
                                    name="totalAmount"
                                    initialValue={0}
                                    fieldProps={{ 
                                        disabled: true,
                                        value: formatPrice(calculateTotal())
                                    }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </ProForm>

                <Card
                    style={{ marginTop: '60px' }}
                    title={
                        <Flex justify="space-between" align="center">
                            <Flex align="center" gap="small">
                                <DiffOutlined /> Danh sách nguyên liệu
                            </Flex>

                            <Flex gap="small" align="center">
                                <Input 
                                    placeholder="Nhập tên nguyên liệu" 
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                />

                                <Button 
                                    type="primary" 
                                    onClick={() => setSearchText('')}
                                >
                                    <SearchOutlined /> Tìm kiếm
                                </Button>

                                <Button type="primary" onClick={() => navigate('/admin/ingredient/')}>
                                    <PlusOutlined /> Thêm nguyên liệu
                                </Button>
                            </Flex>
                        </Flex>
                    }
                >
                    <Table<IIngredient>
                        size='middle'
                        className="order-table"
                        rowClassName="order-table-row"
                        bordered
                        columns={columns}
                        dataSource={filteredIngredients }
                        pagination={{ pageSize: 5 }}
                        rowKey={(record) => record.id || ''}
                        scroll={filteredIngredients.length > 10 ? { y: 48 * 10 } : undefined}
                        locale={{
                            emptyText: 'Không có nguyên liệu nào'
                        }}
                    />
                </Card>
            </div>
        </div>
    )
}

declare type IProps = {
    openDetail: boolean;
    setOpenDetail: (v: boolean) => void;
    dataInit?: IReceipt | null;
}

export const ModalReceipt = (props: IProps) => {
    const { openDetail, setOpenDetail, dataInit } = props;
    const [form] = Form.useForm();

    const columns: ColumnType<IReceiptDetail>[] = [
        {
            title: 'Tên nguyên liệu',
            key: 'name',
            dataIndex: 'ingredient',
            render: (ingredient) => {
                if (dataInit?.type === "IN") {
                    return `[+] ${ingredient.name}`;
                } else {
                    return `[-] ${ingredient.name}`;
                }
            }
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            dataIndex: 'quantity',
            align: 'center',
            width: 100,
        },
        {
            title: 'Đơn giá',
            key: 'price',
            dataIndex: 'price',
            align: 'center',
            width: 110,
            render: (price) => formatPrice(price)
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            align: 'center',
            width: 120,
            render: (_, record) => {
                const total = (record.price ?? 0) * (record.quantity ?? 0);
                return `${formatPrice(total)} ₫`;
            },
        },
    ];

    return (
        <Modal
            title={"Chi tiết biên lai"}
            open={openDetail}
            width={isMobile ? "100%" : 600}
            onCancel={() => setOpenDetail(false)}
            footer={[
                <Button onClick={() => setOpenDetail(false)}>
                    Đóng
                </Button>
            ]}
        >
            <Table<IReceiptDetail>
                    size='small'
                    columns={columns}
                    pagination={false}
                    style={{ marginTop: 20 }}
                    dataSource={dataInit?.receiptDetails}
                    className="order-table"
                    rowClassName="order-table-row"
                    rowKey={(record) => record.id || ''}
                    scroll={{ y: '35vh' }}
                />
        </Modal >
    )
}