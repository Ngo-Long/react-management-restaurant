import React, { useEffect, useState } from 'react';
import OrderCard from './card/order.card';
import ProductCard from './card/product.card';
import { Row, Col, Card, Checkbox } from 'antd';
import DiningTableCard from './card/table.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';

const SaleClient: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);

    // Lấy trạng thái từ localStorage hoặc dùng giá trị mặc định
    const [orderItemsByTable, setOrderItemsByTable] = useState<Record<string, any[]>>(() => {
        const savedOrders = localStorage.getItem('orderItemsByTable');
        return savedOrders ? JSON.parse(savedOrders) : {};
    });

    const [currentDiningTable, setCurrentDiningTable] = useState<{ id: string | null; name: string }>(() => {
        const savedTable = localStorage.getItem('currentDiningTable');
        return savedTable
            ? JSON.parse(savedTable)
            : { id: '', name: 'Mang về' };
    });

    // Lưu dữ liệu vào localStorage khi trạng thái thay đổi
    useEffect(() => {
        localStorage.setItem('orderItemsByTable', JSON.stringify(orderItemsByTable));
    }, [orderItemsByTable]);

    useEffect(() => {
        localStorage.setItem('currentDiningTable', JSON.stringify(currentDiningTable));
    }, [currentDiningTable]);

    const onTabChange = (key: string) => setActiveTabKey(key);

    const handleTableSelect = (tableId: string, tableName: string) => {
        // Lưu lại các món ăn của bàn hiện tại trước khi chuyển bàn
        if (currentDiningTable.id) {
            setOrderItemsByTable(prevState => ({
                ...prevState,
                [currentDiningTable.id!]: [...(prevState[currentDiningTable.id!] || [])],
            }));
        }

        // Chuyển sang bàn mới
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

            // Kiểm tra và cập nhật localStorage chỉ khi có thay đổi
            const newOrderItemsByTable = {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };

            // Kiểm tra sự khác biệt với localStorage
            const savedOrderItems = JSON.parse(localStorage.getItem('orderItemsByTable') || '{}');
            const savedItems = savedOrderItems[currentDiningTable.id!];


            if (JSON.stringify(savedItems) !== JSON.stringify(updatedItems)) {
                // Nếu có sự thay đổi, lưu vào localStorage
                localStorage.setItem('orderItemsByTable', JSON.stringify(newOrderItemsByTable));
            }

            return newOrderItemsByTable;
        });
    };

    const handleRemoveItem = (id: number) => {
        if (!currentDiningTable.id) return;

        setOrderItemsByTable(prevState => {
            const updatedItems = prevState[currentDiningTable.id!].filter(item => item.id !== id);

            // Kiểm tra và cập nhật localStorage chỉ khi có thay đổi
            const newOrderItemsByTable = {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };

            const savedOrderItems = JSON.parse(localStorage.getItem('orderItemsByTable') || '{}');
            const savedItems = savedOrderItems[currentDiningTable.id!];

            if (JSON.stringify(savedItems) !== JSON.stringify(updatedItems)) {
                // Nếu có sự thay đổi, lưu vào localStorage
                localStorage.setItem('orderItemsByTable', JSON.stringify(newOrderItemsByTable));
            }

            return newOrderItemsByTable;
        });
    };

    const handleChangeQuantity = (id: number, delta: number) => {
        if (!currentDiningTable.id) return;

        setOrderItemsByTable(prevState => {
            const updatedItems = prevState[currentDiningTable.id!].map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            );

            // Kiểm tra và cập nhật localStorage chỉ khi có thay đổi
            const newOrderItemsByTable = {
                ...prevState,
                [currentDiningTable.id!]: updatedItems,
            };

            const savedOrderItems = JSON.parse(localStorage.getItem('orderItemsByTable') || '{}');
            const savedItems = savedOrderItems[currentDiningTable.id!];

            if (JSON.stringify(savedItems) !== JSON.stringify(updatedItems)) {
                // Nếu có sự thay đổi, lưu vào localStorage
                localStorage.setItem('orderItemsByTable', JSON.stringify(newOrderItemsByTable));
            }

            return newOrderItemsByTable;
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
