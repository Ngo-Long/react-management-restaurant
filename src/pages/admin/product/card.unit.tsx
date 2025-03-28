import {
    Col,
    Row,
    Tabs,
    Flex,
    Card,
    Input,
    Button,
    message,
    Checkbox,
    InputNumber,
} from 'antd';
import {
    PlusOutlined,
    MinusOutlined,
    SearchOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import {
    ProForm,
    ProFormText,
} from '@ant-design/pro-components';
import { Table } from 'antd/lib';
import { ColumnType } from 'antd/es/table';

import { v4 as uuidv4 } from 'uuid';
import { ingredientApi } from "@/config/api";
import { IUnit, IIngredient } from '@/types/backend';
import React, { useEffect, useRef, useState } from 'react';

interface UnitCardProps {
    unitList: IUnit[];
    setUnitList: React.Dispatch<React.SetStateAction<IUnit[]>>;
}

const UnitCard: React.FC<UnitCardProps> = ({ unitList, setUnitList }) => {
    const isUnitSet = useRef(false);
    const [form] = ProForm.useForm();
    const [unitCurrent, setUnitCurrent] = useState<IUnit | null>();
    const [ingredientList, setIngredientList] = useState<IIngredient[]>([]);
    const [activeKey, setActiveKey] = useState<string>(String(unitList[0]?.id || ''));

    useEffect(() => {
        (async () => {
            const { data } = await ingredientApi.callFetchByRestaurant(`page=1&size=100`);
            data?.result && setIngredientList(data.result);
        })();
    }, []);

    useEffect(() => {
        if (!isUnitSet.current && unitList.length > 0) {
            setUnitCurrent(unitList[0]);
            setActiveKey(String(unitList[0]?.id ?? ''));
            isUnitSet.current = true;
        }
    }, [unitList]);

    // <-- unit
    const handleAddUnit = () => {
        if (unitList.length >= 3) return message.error('Tối đa 3 đơn vị tính!');

        const newUnit: IUnit = {
            id: uuidv4(),
            name: `Đơn vị ${unitList.length + 1}`,
            price: 0,
            costPrice: 0,
            default: false,
            unitDetails: []
        };
        setUnitList([...unitList, newUnit]);
    };

    const handleDeleteUnit = (id: string | undefined) => {
        const updatedUnitList = unitList.filter(unit => unit.id !== id);
        setUnitList(updatedUnitList);

        // nếu chỉ còn 1 đơn vị, đặt lại tên thành "Mặc định"
        if (updatedUnitList.length === 1) {
            const updatedDefaultUnit = { ...updatedUnitList[0], name: "Mặc định" };
            setUnitList([updatedDefaultUnit]);
            form.setFieldsValue({
                [`ingredientUnit-${updatedDefaultUnit.id}`]: "Mặc định"
            });
            setActiveKey(String(updatedDefaultUnit.id));
        } else {
            setUnitList(updatedUnitList);
            if (activeKey === id) {
                setActiveKey(String(updatedUnitList[0]?.id || ''));
            }
        }
    };

    const handleUnitChange = (id: any, key: string, value: any) => {
        if (key === 'default') {
            const updatedUnitList = unitList.map(unit => ({
                ...unit,
                default: unit.id === id ? value : false,
            }));

            setUnitList(updatedUnitList);
            return;
        }

        setUnitList(prev => prev.map(unit =>
            unit.id === id ? { ...unit, [key]: value } : unit)
        );

        setUnitCurrent(prevUnit => {
            if (!prevUnit) return null;
            return {
                ...prevUnit,
                [key]: value
            };
        });
    }

    const renderDeleteButton = (id: any, index: number) => {
        if (index === 0) return null;
        return <DeleteOutlined
            style={{ fontSize: 18, color: '#d32d2d' }}
            onClick={() => handleDeleteUnit(id)}
        />;
    };

    const isUnitNameUnique = (name: string, unitList: IUnit[], currentUnitId?: any) => {
        return !unitList.some(unit => unit.name === name && unit.id !== currentUnitId);
    };
    // end -->

    // <-- ingredient
    const handleQuantityChange = (id: string, value: number) => {
        const isIngredientSelected = unitCurrent?.unitDetails?.some(detail => detail.ingredient?.id === id) ?? false;
        if (!isIngredientSelected) {
            message.warning('Vui lòng chọn nguyên liệu trước.');
            return;
        }

        const newQuantity = Math.max(1, Math.min(99, value));
        setUnitList(prevUnitList =>
            prevUnitList.map(unit => {
                if (unit.id === unitCurrent?.id) {
                    return {
                        ...unit,
                        unitDetails: unit.unitDetails?.map(detail =>
                            detail?.ingredient?.id === id ? { ...detail, quantity: newQuantity } : detail
                        )
                    };
                }
                return unit;
            })
        );

        setUnitCurrent(prevUnit => {
            if (!prevUnit) return null;
            return {
                ...prevUnit,
                unitDetails: prevUnit.unitDetails?.map(detail =>
                    detail?.ingredient?.id === id ? { ...detail, quantity: newQuantity } : detail
                )
            };
        });
    };

    const handleIngredientSelect = (ingredient: IIngredient, checked: boolean) => {
        const updatedUnitDetails = checked
            ? [...unitCurrent?.unitDetails || [], { quantity: 1, ingredient: { id: ingredient.id } }]
            : (unitCurrent?.unitDetails || []).filter(detail => detail?.ingredient?.id !== ingredient.id);

        const updatedUnit = {
            ...unitCurrent,
            unitDetails: updatedUnitDetails
        };

        const updatedUnitList = unitList.map(unit => {
            return unit.id === updatedUnit.id ? updatedUnit : unit;
        });

        setUnitCurrent(updatedUnit);
        setUnitList(updatedUnitList);
    };

    const columns: ColumnType<IIngredient>[] = [
        {
            key: "id",
            title: "Chọn",
            width: 50,
            render: (_, record) => <Checkbox
                checked={unitCurrent?.unitDetails?.some(detail => detail.ingredient?.id === record.id)}
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
                const quantity = unitCurrent?.unitDetails?.find(detail => detail.ingredient?.id === record.id)?.quantity || 1;
                return (
                    <Flex align="center" justify="space-between" style={{ width: '150px' }}>
                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, quantity - 1)}
                        >
                            <MinusOutlined />
                        </Button>

                        <InputNumber
                            style={{ width: '70px', margin: '0 6px' }}
                            type="number" min={1} max={99} value={quantity}
                            onChange={(value) => handleQuantityChange(record.id!, value || 1)}
                        />

                        <Button
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, quantity + 1)}
                        >
                            <PlusOutlined />
                        </Button>
                    </Flex>
                );
            },
        },
        {
            key: "type",
            title: "Đơn vị",
            dataIndex: "type",
            align: "center",
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
                const quantity = unitCurrent?.unitDetails?.find(detail => detail.ingredient?.id === record.id)?.quantity || 1;
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
                        onClick={handleAddUnit}
                        icon={<PlusOutlined />}
                    >
                        Thêm đơn vị tính
                    </Button>}
                >
                    <ProForm form={form} submitter={false}>
                        {unitList.map((unit, index) => (
                            <React.Fragment key={unit.id}>
                                <Row gutter={30}>
                                    <Col span={6}>
                                        <ProFormText
                                            label="Đơn vị"
                                            placeholder="Nhập tên đơn vị"
                                            initialValue={unit.name}
                                            name={`ingredientUnit-${unit.id}`}
                                            rules={[
                                                { required: true, message: "Vui lòng không bỏ trống" },
                                                {
                                                    validator: (_, value) => {
                                                        if (!isUnitNameUnique(value, unitList, unit.id)) {
                                                            return Promise.reject('Tên không được trùng lặp!');
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                },
                                            ]}
                                            fieldProps={{
                                                onChange: (e) => handleUnitChange(unit.id, 'name', e.target.value),
                                                disabled: unitList.length === 1,
                                            }}
                                        />
                                    </Col>

                                    <Col span={6}>
                                        <ProForm.Item
                                            label="Giá vốn"
                                            name={`ingredientCost-${unit.id}`}
                                            initialValue={unit.costPrice || 0}
                                            rules={[{ required: true, message: "Vui lòng nhập giá vốn" }]}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Nhập giá vốn"
                                                formatter={(value) => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                                parser={(value) => value ? parseInt(value.replace(/[^0-9]/g, ''), 10) : 0}
                                                onChange={(value) => handleUnitChange(unit.id, 'costPrice', value)}
                                            />
                                        </ProForm.Item>
                                    </Col>

                                    <Col span={6}>
                                        <ProForm.Item
                                            label="Giá bán"
                                            name={`ingredientPrice-${unit.id}`}
                                            initialValue={unit.price || 0}
                                            rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Nhập giá bán"
                                                formatter={(value) => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                                parser={(value) => value ? parseInt(value.replace(/[^0-9]/g, ''), 10) : 0}
                                                onChange={(value) => handleUnitChange(unit.id, 'price', value)}
                                            />
                                        </ProForm.Item>
                                    </Col>

                                    <Col span={6} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Checkbox
                                            checked={unit.default}
                                            onChange={(e) => handleUnitChange(unit.id, 'default', e.target.checked)}
                                        >
                                            Mặc định bán hàng
                                        </Checkbox>
                                        {renderDeleteButton(unit.id, index)}
                                    </Col>
                                </Row>
                            </React.Fragment>
                        ))}
                    </ProForm>
                </Card>
            </Col>

            <Col span={24} md={24}>
                <Card title="Thành phần">
                    <Tabs
                        activeKey={activeKey}
                        onChange={(activeKey) => {
                            setActiveKey(activeKey);
                            const selectedUnit = unitList.find(unit => unit.id === activeKey);
                            setUnitCurrent(selectedUnit || null);
                        }}
                    >
                        {unitList.map((unit, index) => (
                            <Tabs.TabPane key={unit.id} tab={unit.name || `Đơn vị ${index + 1}`} >
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

export default UnitCard;