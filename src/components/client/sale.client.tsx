import React, { useEffect, useState } from 'react';
import OrderCard from './card/order.card';
import ProductCard from './card/product.card';
import { Row, Col, Card, Checkbox } from 'antd';
import DiningTableCard from './card/table.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';

const SaleClient: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);

    const [orderItemsByTable, setOrderItemsByTable] = useState<Record<string, any[]>>({});
    const [currentDiningTable, setCurrentDiningTable] = useState<{ id: string | null; name: string }>({
        id: '', name: 'Mang về'
    });

    const onTabChange = (key: string) => setActiveTabKey(key);

    const handleTableSelect = (tableId: string, tableName: string) => {
        if (isCheckboxChecked) setActiveTabKey('tab2');
        setCurrentDiningTable({ id: tableId, name: tableName });
    };

    const handleAddItem = (item: any) => {
        if (!currentDiningTable.id) return;

        setOrderItemsByTable(prevState => {
            const currentTableItems = prevState[currentDiningTable.id!] || [];
            const existingItem = currentTableItems.find(i => i.id === item.id);

            // Chỉ thêm hoặc cập nhật khi món ăn không tồn tại trong đơn
            const updatedItems = existingItem
                ? currentTableItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
                : [...currentTableItems, { ...item, quantity: 1 }];

            return {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };
        });
    };

    const handleRemoveItem = (id: number) => {
        if (!currentDiningTable.id) return;

        setOrderItemsByTable(prevState => {
            const updatedItems = prevState[currentDiningTable.id!].filter(item => item.id !== id);

            return {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };
        });
    };

    const handleChangeQuantity = (id: number, delta: number) => {
        if (!currentDiningTable.id) return;

        setOrderItemsByTable(prevState => {
            const updatedItems = prevState[currentDiningTable.id!].map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            );

            return {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };
        });
    };

    const tabList = [
        {
            key: 'tab1',
            tab: 'Phòng bàn',
            icon: <GatewayOutlined />,
        },
        {
            key: 'tab2',
            tab: 'Thực đơn',
            icon: <CoffeeOutlined />,
        },
    ];

    const contentList: Record<string, React.ReactNode> = {
        tab1: <DiningTableCard
            activeTabKey={activeTabKey}
            onTabChange={onTabChange}
            currentDiningTable={currentDiningTable}
            handleTableSelect={(id, name) => handleTableSelect(id, name)}
        />,
        tab2: <ProductCard
            onAddItem={handleAddItem}
            activeTabKey={activeTabKey}
        />
    };

    return (
        <Row className={'no-select'}>
            <Col span={15}>
                <Card
                    style={{ height: '100vh' }}
                    tabList={tabList}
                    activeTabKey={activeTabKey}
                    bordered={true}
                    onTabChange={onTabChange}
                    tabBarExtraContent={
                        <Checkbox
                            checked={isCheckboxChecked}
                            onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                            style={{ fontWeight: 500 }}

                        >
                            Mở thực đơn khi chọn bàn
                        </Checkbox>
                    }
                >
                    {contentList[activeTabKey]}
                </Card>
            </Col>

            <Col span={9} >
                <OrderCard
                    orderItems={orderItemsByTable[currentDiningTable.id!] || []}
                    onRemoveItem={handleRemoveItem}
                    onChangeQuantity={handleChangeQuantity}
                    currentDiningTable={currentDiningTable}
                    orderItemsByTable={orderItemsByTable}
                    setOrderItemsByTable={setOrderItemsByTable}
                    onTabChange={onTabChange}
                />
            </Col>
        </Row>
    );
};

export default SaleClient;
