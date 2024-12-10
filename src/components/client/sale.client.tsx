import React, { useState } from 'react';
import OrderCard from './card/order.card';
import ProductCard from './card/product.card';
import { Row, Col, Card, Checkbox, message, notification } from 'antd';
import DiningTableCard from './card/table.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';
import { IOrder } from '@/types/backend';
import { useAppDispatch } from '@/redux/hooks';
import { fetchLatestUnpaidOrderByTableId } from '@/redux/slice/orderSlide';
import { orderApi, orderDetailApi } from "@/config/api";
import { IOrderDetail } from '../../types/backend';
import { fetchOrderDetailsByOrderId } from '@/redux/slice/orderDetailSlide';
import '@/styles/client.table.scss';

const SaleClient: React.FC = () => {
    const dispatch = useAppDispatch();

    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);

    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
    const [currentTable, setCurrentTable] = useState({ id: '', name: 'Mang về' });

    const handleTableSelect = (id: string, name: string) => {
        // reset
        setCurrentTable({ id, name });

        // move tab and fetch order
        if (isCheckboxChecked) setActiveTabKey('tab2');
        if (id) {
            dispatch(fetchLatestUnpaidOrderByTableId(id))
                .unwrap()
                .then((data) => setCurrentOrder(data || null))
                .catch(() => message.error('Không thể lấy đơn hàng cho bàn này!'));
        }
    };

    const handleItemSelect = async (item: IOrderDetail) => {
        if (currentOrder?.id) {
            await addProductToOrder(item, currentOrder);
        } else {
            const newOrder = await createOrder();
            if (newOrder) await addProductToOrder(item, newOrder);
        }
    };

    const createOrder = async () => {
        const order = {
            status: "PENDING",
            diningTable: {
                id: currentTable.id,
                name: currentTable.name || 'Mang về'
            }
        };

        try {
            const res = await orderApi.callCreate(order);
            if (res.data) {
                setCurrentOrder(res.data);
                return res.data;
            } else {
                notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
                return null;
            }
        } catch (error: any) {
            notification.error({ message: 'Lỗi kết nối', description: error.message });
            return null;
        }
    }

    const addProductToOrder = async (item: IOrderDetail, order: IOrder) => {
        if (!order?.id) {
            notification.error({ message: 'Không thể thêm món ăn', description: 'Đơn hàng không hợp lệ.' });
            return;
        }

        const newItem = {
            ...item,
            order: { id: order.id },
        };

        const res = await orderDetailApi.callCreate(newItem);
        if (res.data) {
            dispatch(fetchOrderDetailsByOrderId(order.id));

            // update order
            const updatedOrder = await orderApi.callUpdate({ ...order, status: 'PENDING' });
            setCurrentOrder(updatedOrder.data!);
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }
    }

    const tabList = [
        { key: 'tab1', tab: 'Phòng bàn', icon: <GatewayOutlined /> },
        { key: 'tab2', tab: 'Thực đơn', icon: <CoffeeOutlined /> },
    ];

    const contentList: Record<string, React.ReactNode> = {
        tab1: <DiningTableCard
            currentTable={currentTable}
            handleTableSelect={(id, name) => handleTableSelect(id, name)}
        />,
        tab2: <ProductCard
            handleItemSelect={handleItemSelect}
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
                    onTabChange={(key) => setActiveTabKey(key)}
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
                    currentOrder={currentOrder}
                    setCurrentOrder={setCurrentOrder}
                    currentTable={currentTable}
                    setActiveTabKey={setActiveTabKey}
                />
            </Col>
        </Row>
    );
};

export default SaleClient;
