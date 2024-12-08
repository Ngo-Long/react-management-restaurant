import React, { useEffect, useState } from 'react';
import OrderCard from './card/order.card';
import ProductCard from './card/product.card';
import { Row, Col, Card, Checkbox, message, notification } from 'antd';
import DiningTableCard from './card/table.card';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';
import { IOrder } from '@/types/backend';
import { useAppDispatch } from '@/redux/hooks';
import { fetchLatestPendingOrderByTableId } from '@/redux/slice/orderSlide';
import { orderApi, orderDetailApi } from "@/config/api";
import { IOrderDetail } from '../../types/backend';

const SaleClient: React.FC = () => {
    const dispatch = useAppDispatch();

    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(true);

    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
    const [currentDiningTable, setCurrentDiningTable] = useState({ id: '', name: 'Mang về' });

    useEffect(() => {
        console.log('Current order updated:', currentOrder);
    }, [currentOrder]);


    const handleTableSelect = (id: string, name: string) => {
        // reset
        setCurrentDiningTable({ id, name });

        // move tab and fetch order
        if (isCheckboxChecked) setActiveTabKey('tab2');
        if (id) {
            dispatch(fetchLatestPendingOrderByTableId(id))
                .unwrap()
                .then((data) => setCurrentOrder(data || null))
                .catch(() => message.error('Không thể lấy đơn hàng cho bàn này!'));
        }
    };

    const handleItemSelect = async (item: IOrderDetail) => {
        console.log(item);

        if (currentOrder?.id) {
            addProductToOrder(item);
        } else {
            await createOrder();
            addProductToOrder(item);
        }
    };

    const createOrder = async () => {
        const order = {
            status: "PENDING",
            diningTable: {
                id: currentDiningTable.id,
                name: currentDiningTable.name || 'Mang về'
            }
        };

        const res = await orderApi.callCreate(order);
        if (res.data) {
            // setCurrentOrder(res.data);
            message.success('Tạo đơn hàng thành công!');
        } {
            notification.error({ message: 'Có lỗi đơn hàng xảy ra', description: res.message });
        }

    }

    const addProductToOrder = async (item: IOrderDetail) => {
        const newItem = {
            ...item,
            order: {
                id: currentOrder?.id
            }
        };

        const res = await orderDetailApi.callCreate(newItem);
        (res.data)
            ? message.success('Thêm món ăn thành công!')
            : notification.error({ message: 'Có lỗi xảy ra', description: res.message });
    }

    // <-- Tab list
    const tabList = [
        { key: 'tab1', tab: 'Phòng bàn', icon: <GatewayOutlined /> },
        { key: 'tab2', tab: 'Thực đơn', icon: <CoffeeOutlined /> },
    ];

    const contentList: Record<string, React.ReactNode> = {
        tab1: <DiningTableCard
            currentDiningTable={currentDiningTable}
            handleTableSelect={(id, name) => handleTableSelect(id, name)}
        />,
        tab2: <ProductCard
            handleItemSelect={handleItemSelect}
        />
    };
    // end -->

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
                    currentDiningTable={currentDiningTable}
                />
            </Col>
        </Row>
    );
};

export default SaleClient;
