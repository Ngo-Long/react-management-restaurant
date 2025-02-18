import '@/styles/client.table.scss';
import React, { useState } from 'react';
import { IOrder } from '@/types/backend';
import { useAppDispatch } from '@/redux/hooks';
import { IOrderDetail } from '../../types/backend';
import { orderApi, orderDetailApi } from "@/config/api";
import OrderCard from '../../components/client/card/order.card';
import ProductCard from '../../components/client/card/product.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';
import DiningTableCard from '../../components/client/card/table.card';
import { Row, Col, Card, Checkbox, message, notification } from 'antd';
import { fetchLatestUnpaidOrderByTableId } from '@/redux/slice/orderSlide';
import { fetchOrderDetailsByOrderId } from '@/redux/slice/orderDetailSlide';

const SaleClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
    const [currentTable, setCurrentTable] = useState({ id: '', name: 'Chọn bàn' });

    const handleSelectedTable = (id: string, name: string) => {
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
            const newOrder = await createPendingOrder();
            if (newOrder) await addProductToOrder(item, newOrder);
        }
    };

    const createPendingOrder = async () => {
        const order = {
            status: "PENDING",
            diningTables: [{
                id: currentTable.id
            }]
        };

        const res = await orderApi.callCreate(order);
        if (res.data) {
            setCurrentOrder(res.data);
            return res.data;
        } else {
            notification.warning({ message: 'Vui lòng chọn bàn trước.', description: "" });
            return null;
        }
    }

    const addProductToOrder = async (item: IOrderDetail, order: IOrder) => {
        if (!order?.id) {
            notification.error({ message: 'Có lỗi xảy ra', description: 'Đơn hàng không hợp lệ.' });
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

    const contentList: Record<string, React.ReactNode> = {
        tab1: <DiningTableCard
            currentTable={currentTable}
            handleSelectedTable={(id, name) => handleSelectedTable(id, name)}
        />,
        tab2: <ProductCard handleItemSelect={handleItemSelect} />
    };

    return (
        <Row className={'no-select'}>
            <Col span={15}>
                <Card
                    style={{ height: '100vh' }}
                    tabList={[
                        { key: 'tab1', tab: 'Phòng bàn', icon: <GatewayOutlined /> },
                        { key: 'tab2', tab: 'Thực đơn', icon: <CoffeeOutlined /> }
                    ]}
                    activeTabKey={activeTabKey}
                    bordered={true}
                    onTabChange={(key) => setActiveTabKey(key)}
                    tabBarExtraContent={
                        <Checkbox
                            style={{ fontWeight: 500 }}
                            checked={isCheckboxChecked}
                            onChange={(e) => setIsCheckboxChecked(e.target.checked)}
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
