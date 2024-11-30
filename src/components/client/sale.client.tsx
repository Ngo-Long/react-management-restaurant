import React, { useState } from 'react';
import OrderCard from './card/order.card';
import ProductCard from './card/product.card';
import { Row, Col, Card, Checkbox } from 'antd';
import DiningTableCard from './card/table.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';

const SaleClient: React.FC = () => {
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');

    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);
    const [currentDiningTable, setCurrentDiningTable] = useState<{
        id: string | null; name: string;
    }>({
        id: null, name: 'Mang về',
    });

    const onTabChange = (key: string) => setActiveTabKey(key);

    const handleTableSelect = (tableId: string, tableName: string) => {
        setCurrentDiningTable({ id: tableId, name: tableName });
        if (isCheckboxChecked) setActiveTabKey('tab2');
    };

    const handleAddItem = (item: any) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const handleRemoveItem = (id: number) => {
        setOrderItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const handleChangeQuantity = (id: number, delta: number) => {
        setOrderItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
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
            handleTableSelect={(id, name) => handleTableSelect(id, name)}
        />,
        tab2: <ProductCard
            onAddItem={handleAddItem}
            activeTabKey={activeTabKey}
        />
    };

    return (
        <Row>
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

            <Col span={9}>
                <OrderCard
                    orderItems={orderItems}
                    onRemoveItem={handleRemoveItem}
                    onChangeQuantity={handleChangeQuantity}
                    currentDiningTable={currentDiningTable}
                />
            </Col>
        </Row>
    );
};

export default SaleClient;
