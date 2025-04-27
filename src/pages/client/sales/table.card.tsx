import dayjs from 'dayjs';
import { Col, Row } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { formatPrice } from '@/utils/format';
import { useAppDispatch } from '@/redux/hooks';
import { IDiningTable } from '@/types/backend';
import React, { useEffect, useState } from 'react';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';

interface DiningTableCardProps {
    currentTable: IDiningTable;
    handleSelectedTable: (dataTable: IDiningTable) => void;
}

const DiningTableCard: React.FC<DiningTableCardProps> = ({ currentTable, handleSelectedTable }) => {
    const dispatch = useAppDispatch();
    const diningTables = useSelector((state: RootState) => state.diningTable.result);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100&sort=sequence,asc&filter=active=true' }));
    }, [dispatch]);

    const uniqueLocations = Array.from(new Set(diningTables.map(table => table?.location)));

    const filteredTables = diningTables.filter((table) => {
        return !selectedLocation || table.location === selectedLocation;
    });

    return (
        <div className="container">
            <div className="container-content">
                <Row gutter={[20, 22]}>
                    {filteredTables.map((table) => {
                        const currentOrder = (table?.orders || []).find(order => order?.id != null);

                        return (
                            <Col span={6} key={table.id}>
                                <div
                                    className={`table-item ${currentTable.id === table.id ? 'active' : ''}`}
                                    onClick={() => handleSelectedTable(table)}
                                >
                                    <div className="item-card">
                                        <p className="item-card__title">{table.name}</p>
                                    </div>

                                    {currentOrder && (
                                        <div className={`item-info ${currentTable.id === table.id ? 'active' : ''}`}>
                                            <div className="item-info__time">
                                                {currentOrder.createdDate &&
                                                    `${dayjs().diff(dayjs(currentOrder.createdDate), 'hour')}g${dayjs().diff(dayjs(currentOrder.createdDate), 'minute') % 60}p`}
                                            </div>

                                            <div className="item-info__price">
                                                {formatPrice(currentOrder.totalPrice)}
                                                {/* {(currentOrder.totalPrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} */}
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
            </div>
        </div>
    );
};

export default DiningTableCard;
