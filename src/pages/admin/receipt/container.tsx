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
} from "@ant-design/pro-components";
import { ColumnType } from "antd/es/table";

import dayjs from 'dayjs';
import { receiptApi } from "@/config/api";
import '../../../styles/client.table.scss';
import { formatPrice } from "@/utils/format";
import styles from 'styles/admin.module.scss';
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IIngredient, IReceipt } from "@/types/backend";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserByRestaurant } from "@/redux/slice/userSlide";
import { fetchSupplierByRestaurant } from "@/redux/slice/supplierSlide";
import { fetchIngredientByRestaurant } from "@/redux/slice/ingredientSlide";

const ViewUpsertReceipt = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const invoiceRef = useRef<HTMLDivElement | null>(null);

    const [customerPaid, setCustomerPaid] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [ingredientList, setIngredientList] = useState<IIngredient[]>([]);

    const users = useAppSelector(state => state.user.result);
    const currentUser = useAppSelector(state => state.account.user);
    const suppliers = useAppSelector(state => state.supplier.result);
    const ingredients = useAppSelector(state => state.ingredient.result);
    const currentRestaurant = useAppSelector(state => state.account.user.restaurant);

    useEffect(() => {
        fetch();
    }, [dispatch]);

    const fetch = () => {
        dispatch(fetchUserByRestaurant({ query: '?page=1&size=100' }));
        dispatch(fetchSupplierByRestaurant({ query: '?page=1&size=100' }));
        dispatch(fetchIngredientByRestaurant({ query: '?page=1&size=100' }));
    };

    const handleSetCustomerPaid = (amount: number) => {
        setCustomerPaid(amount);

        // const total = currentOrder?.totalPrice || 0;
        // setReturnAmount(Math.max(0, amount - total));
    };

    const handleQuantityChange = (id: string, value: number) => {
        const newQuantity = Math.max(1, Math.min(99, value));
        setIngredientList(prevList =>
            prevList.map(ingredient =>
                ingredient.id === id ? { ...ingredient, quantity: newQuantity } : ingredient
            )
        );
    };

    const submitReceipt = async (valuesForm: any) => {
        const { type, note, discount, totalAmount, status } = valuesForm;

        // create invoice
        console.log({
            type,
            note,
            discount,
            totalAmount,
            status,
            supplier: {
                id: 1
            },
            receiptDetails: [
                {
                    price: 3000,
                    quantity: 1,
                    ingredient: { id: 1 }
                },
                {
                    price: 3000,
                    quantity: 1,
                    ingredient: { id: 1 }
                }
            ]
        });

        // const res = await receiptApi.callCreate({
        //     type,
        //     note,
        //     totalAmount,
        //     status,
        //     restaurant: {
        //         id: currentRestaurant?.id,
        //         name: currentRestaurant?.name
        //     }
        // });

        // if (res.data) {
        //     message.success(`Tạo phiếu [ ${res.data.id} ] thành công `);
        // } else {
        //     notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
        // }
    }

    const columns: ColumnType<IIngredient>[] = [
        {
            key: "id",
            title: "Chọn",
            width: 60,
            align: "center",
            render: (_, record) => <Checkbox />
        },
        {
            key: "name",
            dataIndex: "name",
            title: "Tên nguyên liệu",
            width: 300,
        },
        {
            key: "quantity",
            dataIndex: "initialQuantity",
            title: "Số lượng",
            width: 168,
            align: "center",
            render: (_, record) => {
                return (
                    <Flex align="center" justify="space-between" style={{ width: '150px' }}>
                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, (record.initialQuantity || 1) - 1)}
                        >
                            <MinusOutlined />
                        </Button>

                        <InputNumber
                            style={{ width: '70px', margin: '0 6px' }}
                            type="number" min={1} max={99}
                            onChange={(value) => handleQuantityChange(record.id!, value || 1)}
                        />

                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, (record.initialQuantity || 1) + 1)}
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
            render(_, record) {
                return <>{formatPrice(record.price)}</>
            },
        },
        {
            key: "price",
            dataIndex: "price",
            title: "Giảm giá",
            align: "center",
            render: (_, record) => {
                return (
                    <InputNumber
                        min={1}
                        max={99}
                        value={0}
                        type="number"
                    />
                );
            },
        },
        {
            key: 'price',
            dataIndex: 'price',
            title: 'Thành tiền',
            align: "center",
            render(_, record) {
                return <>{formatPrice(record.price)}</>
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
                                <Form.Item
                                    label="Nhà cung cấp"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                >
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Chọn nhà cung cấp"
                                        suffixIcon={<PlusOutlined style={{ fontSize: 20, color: '#555' }} />}
                                        options={suppliers.map(supplier => ({
                                            value: supplier.id,
                                            label: supplier.name
                                        }))}
                                    />
                                </Form.Item>
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
                                            <Badge count={0} showZero style={{ marginLeft: '6px' }} />
                                        </>
                                    }
                                    name="totalAmount"
                                    initialValue={0}
                                    fieldProps={{ disabled: true }}
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
                                <DiffOutlined /> Chọn nguyên liệu
                            </Flex>

                            <Flex gap="small" align="center">
                                <Input placeholder="Nhập tên nguyên liệu" />

                                <Button type="primary">
                                    <SearchOutlined /> Tìm kiếm
                                </Button>

                                <Button type="primary">
                                    <PlusOutlined />  Thêm nguyên liệu
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
                        dataSource={ingredients}
                        pagination={{ pageSize: 5 }}
                        rowKey={(record) => record.id || ''}
                        scroll={ingredients.length > 10 ? { y: 48 * 10 } : undefined}
                    />
                </Card>
            </div>
        </div>
    )
}

export default ViewUpsertReceipt;