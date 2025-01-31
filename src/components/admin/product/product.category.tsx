import {
    Button, Col, InputNumber, Row,
    Checkbox, Card, Tabs, Input, message
} from 'antd';
import {
    DeleteOutlined, MinusOutlined,
    PlusOutlined, SearchOutlined
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { v4 as uuidv4 } from 'uuid';
import { ColumnType } from 'antd/es/table';
import { ingredientApi } from "@/config/api";
import React, { useEffect, useRef, useState } from 'react';
import { ProFormText, ProForm } from '@ant-design/pro-components';
import { ICategory, IIngredient } from '@/types/backend';

interface CategoryCardProps {
    categoryList: ICategory[];
    setCategoryList: React.Dispatch<React.SetStateAction<ICategory[]>>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categoryList, setCategoryList }) => {
    const isCategorySet = useRef(false);
    const [ingredientList, setIngredientList] = useState<IIngredient[]>([]);
    const [categoryCurrent, setCategoryCurrent] = useState<ICategory | null>();

    useEffect(() => {
        (async () => {
            const { data } = await ingredientApi.callFetchByRestaurant(`page=1&size=100`);
            data?.result && setIngredientList(data.result);
        })();
    }, []);

    useEffect(() => {
        if (!isCategorySet.current && categoryList.length > 0) {
            setCategoryCurrent(categoryList[0]);
            isCategorySet.current = true;
        }
    }, [categoryList]);

    // <-- category
    const handleAddCategory = () => {
        if (categoryList.length >= 3) return message.error('Tối đa 3 đơn vị tính!');

        const newCategory: ICategory = {
            id: uuidv4(),
            name: `Đơn vị ${categoryList.length + 1}`,
            price: 0,
            costPrice: 0,
            default: false,
            categoryDetails: []
        };
        setCategoryList([...categoryList, newCategory]);
    };

    const handleDeleteCategory = (id: string | undefined) => {
        setCategoryList(categoryList.filter(category => category.id !== id));
    };

    const handleCategoryChange = (id: any, key: string, value: any) => {
        if (key === 'default') {
            const updatedCategoryList = categoryList.map(category => ({
                ...category,
                default: category.id === id ? value : false,
            }));

            setCategoryList(updatedCategoryList);
            return;
        }

        setCategoryList(prev => prev.map(category =>
            category.id === id ? { ...category, [key]: value } : category)
        );
    }

    const renderDeleteButton = (id: any, index: number) => {
        if (index === 0) return null;
        return <DeleteOutlined
            style={{ fontSize: 18, color: '#d32d2d' }}
            onClick={() => handleDeleteCategory(id)}
        />;
    };

    const isCategoryNameUnique = (name: string, categoryList: ICategory[], currentCategoryId?: any) => {
        return !categoryList.some(category => category.name === name && category.id !== currentCategoryId);
    };
    // end -->

    // <-- ingredient
    const handleQuantityChange = (id: string, value: number) => {
        const newQuantity = Math.max(1, Math.min(99, value));

        setCategoryList(prevCategoryList =>
            prevCategoryList.map(category => {
                if (category.id === categoryCurrent?.id) {
                    return {
                        ...category,
                        categoryDetails: category.categoryDetails.map(detail =>
                            detail?.ingredient?.id === id ? { ...detail, quantity: newQuantity } : detail
                        )
                    };
                }
                return category;
            })
        );

        setCategoryCurrent(prevCategory => {
            if (!prevCategory) return null;
            return {
                ...prevCategory,
                categoryDetails: prevCategory.categoryDetails.map(detail =>
                    detail?.ingredient?.id === id ? { ...detail, quantity: newQuantity } : detail
                )
            };
        });
    };

    const handleIngredientSelect = (ingredient: IIngredient, checked: boolean) => {
        const updatedCategoryDetails = checked
            ? [...categoryCurrent?.categoryDetails || [], { quantity: 1, ingredient: { id: ingredient.id } }]
            : (categoryCurrent?.categoryDetails || []).filter(detail => detail?.ingredient?.id !== ingredient.id);

        const updatedCategory = {
            ...categoryCurrent,
            categoryDetails: updatedCategoryDetails
        };

        const updatedCategoryList = categoryList.map(category =>
            category.id === updatedCategory.id ? updatedCategory : category
        );

        setCategoryCurrent(updatedCategory);
        setCategoryList(updatedCategoryList);
    };

    const columns: ColumnType<IIngredient>[] = [
        {
            key: "id",
            title: "Chọn",
            width: 50,
            render: (_, record) => <Checkbox
                checked={categoryCurrent?.categoryDetails.some(detail => detail.ingredient?.id === record.id)}
                onChange={(e) => handleIngredientSelect(record, e.target.checked)}
            />
        },
        {
            key: "name",
            dataIndex: "name",
            title: "Tên nguyên liệu",
        },
        {
            key: "id",
            title: "Số lượng",
            width: 200,
            render: (_, record) => {
                const quantity = categoryCurrent?.categoryDetails.find(detail => detail.ingredient?.id === record.id)?.quantity || 1;
                return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '150px' }}>
                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id, quantity - 1)}
                        >
                            <MinusOutlined />
                        </Button>

                        <InputNumber
                            style={{ width: '70px', margin: '0 6px' }}
                            type="number" min={1} max={99} value={quantity}
                            onChange={(value) => handleQuantityChange(record.id, value || 1)}
                        />

                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id, quantity + 1)}
                        >
                            <PlusOutlined />
                        </Button>
                    </div>
                );
            },
        },
        {
            key: "unit",
            title: "Đơn vị",
            dataIndex: "unit",
        },
        {
            key: 'price',
            title: 'Giá vốn',
            align: "center",
            dataIndex: 'price',
            render(_, record) {
                const str = "" + (record?.price || 0);
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Thành tiền',
            align: "center",
            dataIndex: 'price',
            render(_, record) {
                const quantity = categoryCurrent?.categoryDetails.find(detail => detail.ingredient?.id === record.id)?.quantity || 1;
                const totalPrice = ((quantity) * (record?.price || 1)) + "";
                return <>{totalPrice?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>;
            },
        },

    ];
    // end -->

    return (
        <Row gutter={[30, 30]} style={{ marginTop: '20px' }}>
            <Col span={24} md={24}>
                <Card
                    title="Đơn vị tính"
                    extra={<Button
                        color="danger"
                        variant="outlined"
                        onClick={handleAddCategory}
                        icon={<PlusOutlined />}
                    >
                        Thêm đơn vị tính
                    </Button>}
                >
                    {categoryList.map((category, index) => (
                        <React.Fragment key={category.id}>
                            <Row gutter={30}>
                                <Col span={6}>
                                    <ProFormText
                                        label="Đơn vị"
                                        placeholder="Nhập tên đơn vị"
                                        initialValue={category.name}
                                        name={`ingredientUnit-${category.id}`}
                                        rules={[
                                            { required: true, message: "Vui lòng không bỏ trống" },
                                            {
                                                validator: (_, value) => {
                                                    if (!isCategoryNameUnique(value, categoryList, category.id)) {
                                                        return Promise.reject('Tên không được trùng lặp!');
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                        fieldProps={{ onChange: (e) => handleCategoryChange(category.id, 'name', e.target.value) }}
                                    />
                                </Col>

                                <Col span={6}>
                                    <ProForm.Item
                                        label="Giá vốn"
                                        name={`ingredientCost-${category.id}`}
                                        rules={[{ required: true, message: "Vui lòng nhập giá vốn" }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="Nhập giá vốn"
                                            value={category.costPrice || 0} min={0}
                                            formatter={(value) => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                            parser={(value) => value ? parseInt(value.replace(/[^0-9]/g, ''), 10) : 0}
                                            onChange={(value) => handleCategoryChange(category.id, 'costPrice', value)}
                                        />
                                    </ProForm.Item>
                                </Col>

                                <Col span={6}>
                                    <ProForm.Item
                                        label="Giá bán"
                                        name={`ingredientPrice-${category.id}`}
                                        rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="Nhập giá bán"
                                            value={category.price || 0} min={0}
                                            formatter={(value) => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                            parser={(value) => value ? parseInt(value.replace(/[^0-9]/g, ''), 10) : 0}
                                            onChange={(value) => handleCategoryChange(category.id, 'price', value)}
                                        />
                                    </ProForm.Item>
                                </Col>

                                <Col span={6} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Checkbox
                                        checked={category.default}
                                        onChange={(e) => handleCategoryChange(category.id, 'default', e.target.checked)}
                                    >
                                        Mặc định bán hàng
                                    </Checkbox>
                                    {renderDeleteButton(category.id, index)}
                                </Col>
                            </Row>
                        </React.Fragment>
                    ))}
                </Card>
            </Col>

            <Col span={24} md={24}>
                <Card title="Thành phần">
                    <Tabs
                        defaultActiveKey="1"
                        onChange={(activeKey) => {
                            const selectedCategory = categoryList.find(category => category.id == activeKey);
                            setCategoryCurrent(selectedCategory || null);
                        }}
                    >
                        {categoryList.map((category, index) => (
                            <Tabs.TabPane key={category.id} tab={category.name || `Đơn vị ${index + 1}`} >
                                <Row gutter={[10, 30]} style={{ marginBottom: '15px' }}>
                                    <Col span={16}>
                                        <Input placeholder="Tìm kiếm nguyên liệu" />
                                    </Col>

                                    <Col span={4}>
                                        <Button type="primary" icon={<SearchOutlined />} >
                                            Tìm kiếm
                                        </Button>
                                    </Col>

                                    <Col span={4}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm nguyên liệu
                                        </Button>
                                    </Col>
                                </Row>

                                <Table<IIngredient>
                                    rowKey="id"
                                    columns={columns}
                                    dataSource={ingredientList}
                                    pagination={{ pageSize: 5 }}
                                />
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                </Card>
            </Col>
        </Row>
    );
};

export default CategoryCard;