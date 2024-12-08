import { Col, Row } from 'antd';
import '@/styles/client.table.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useState } from 'react';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { IOrder } from '@/types/backend';
import { fetchLatestPendingOrderByTableId } from '@/redux/slice/orderSlide';
import dayjs from 'dayjs';

interface DiningTableCardProps {
    currentDiningTable: { id?: string | null; name: string };
    handleTableSelect: (id: string, name: string) => void;
}

const DiningTableCard: React.FC<DiningTableCardProps> = ({
    currentDiningTable,
    handleTableSelect
}) => {
    const dispatch = useAppDispatch();
    const diningTables = useSelector((state: RootState) => state.diningTable.result);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [currentOrders, setCurrentOrders] = useState<{ [key: string]: IOrder }>({});

    useEffect(() => {
        dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
    }, [dispatch]);

    useEffect(() => {
        // fetch the latest orders for occupied tables
        const fetchOrders = async () => {
            const ordersMap: { [key: string]: IOrder } = {};

            // filter table status "OCCUPIED"
            const occupiedTables = diningTables.filter((table) => table.status === 'OCCUPIED');

            // fetch the latest order
            for (const table of occupiedTables) {
                const order = await dispatch(fetchLatestPendingOrderByTableId(table.id!)).unwrap();
                if (order) ordersMap[table.id!] = order;
            }

            // update state
            setCurrentOrders(ordersMap);
        };
        fetchOrders();
    }, [dispatch, diningTables]);

    const handleClickTable = (id: string, name: string) => {
        handleTableSelect(id, name);
    };

    const uniqueLocations = Array.from(new Set(diningTables.map(table => table.location)));

    const filteredTables = diningTables
        .filter((table) => !selectedLocation || table.location === selectedLocation)
        .map((table) => ({ ...table, currentOrder: currentOrders[table.id!] }));

    return (
        <div className="container">
            <div className="container-content">
                <Row gutter={[20, 22]}>
                    {filteredTables.map((table) => {
                        const currentOrder = currentOrders[table.id || ''];
                        return (
                            <Col span={6} key={table.id}>
                                <div
                                    className={`table-item ${currentDiningTable.id === table.id ? 'active' : ''}`}
                                    onClick={() => handleClickTable(table.id || '', table.name || '')}
                                >
                                    <div className="item-card">
                                        <p className="item-card__title">{table.name}</p>
                                    </div>

                                    {currentOrder && (
                                        <div className={`item-info ${currentDiningTable.id === table.id ? 'active' : ''}`}>
                                            <div className="item-info__time">
                                                {currentOrder.createdDate &&
                                                    `${dayjs().diff(dayjs(currentOrder.createdDate), 'hour')}g${dayjs().diff(dayjs(currentOrder.createdDate), 'minute') % 60}p`}
                                            </div>

                                            <div className="item-info__price">
                                                {(currentOrder.totalPrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            <div className="container-category">
                <>
                    <div
                        className={`category-card ${selectedLocation === null ? 'active' : ''}`}
                        onClick={() => setSelectedLocation(null)}
                    >
                        <p className="category-card__name">Tất cả</p>
                    </div>

                    {uniqueLocations.map((location, index) => (
                        <div
                            key={index}
                            className={`category-card ${selectedLocation === location ? 'active' : ''}`}
                            onClick={() => setSelectedLocation(location || null)}
                        >
                            <p className="category-card__name">{location}</p>
                        </div>
                    ))}
                </>
            </div>
        </div>
    );
};

export default DiningTableCard;
