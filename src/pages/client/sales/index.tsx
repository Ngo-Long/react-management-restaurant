import {
    Row,
    Col,
    Card,
    notification
} from 'antd';
import {
    CoffeeOutlined,
    GatewayOutlined
} from '@ant-design/icons';
import '@/styles/client.table.scss';
import OrderCard from './order';
import React, { useState } from 'react';
import ProductCard from './product.card';
import DiningTableCard from './table.card';
import { useAppDispatch } from '@/redux/hooks';
import { IOrderDetail } from '../../../types/backend';
import { IDiningTable, IOrder } from '@/types/backend';
import { orderApi, orderDetailApi } from "@/config/api";
import { fetchOrderDetailsByOrderId } from '@/redux/slice/orderDetailSlide';
import { fetchLatestPendingOrderByTableId } from '@/redux/slice/orderSlide';

const SaleClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const [currentTable, setCurrentTable] = useState<IDiningTable>({
        id: '',
        name: 'Chọn bàn',
        location: '',
        active: false,
    });

    const handleSelectedTable = (dataTable: IDiningTable) => {
        const now = Date.now();
        const isDoubleClick = now - lastClickTime < 300;

        setCurrentTable(dataTable);
        setLastClickTime(now);

        // move tab to menu if double clicked
        if (isDoubleClick) {
            setActiveTabKey('tab2');
        }

        if (dataTable.id) {
            dispatch(fetchLatestPendingOrderByTableId(dataTable.id))
                .unwrap()
                .then((data) => setCurrentOrder(data || null))
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
            status: 'PENDING',
            option: 'DINE_IN',
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
            const updatedOrder = await orderApi.callUpdate({ ...order, status: 'PENDING' });
            setCurrentOrder(updatedOrder.data!);
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }
    }

    const contentList: Record<string, React.ReactNode> = {
        tab1: <DiningTableCard
            currentTable={currentTable}
            handleSelectedTable={handleSelectedTable}
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
                    bordered={true}
                    activeTabKey={activeTabKey}
                    onTabChange={(key) => setActiveTabKey(key)}
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
