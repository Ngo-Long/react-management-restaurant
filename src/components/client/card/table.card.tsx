import { Col, Row } from 'antd';
import '@/styles/client.table.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useState } from 'react';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';

interface DiningTableCardProps {
    activeTabKey: string;
    onTabChange: (key: string) => void;
}

const DiningTableCard: React.FC<DiningTableCardProps> = ({ activeTabKey, onTabChange }) => {
    const dispatch = useAppDispatch();
    const diningTables = useSelector((state: RootState) => state.diningTable.result);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const uniqueLocations = Array.from(
        new Set(diningTables.map(table => table.location))
    );

    const filteredTables = selectedLocation
        ? diningTables.filter(table => table.location === selectedLocation)
        : diningTables;

    useEffect(() => {
        dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
    }, [dispatch]);

    return (
        <div className="container">
            <div className="container-content">
                <Row gutter={[20, 22]}>
                    {filteredTables.map((table) => (
                        <Col span={6} key={table.id}>
                            <div className="table-item">
                                <div className="item-card">
                                    <p className="item-card__title">{table.name}</p>
                                </div>

                                <div className="item-info">
                                </div>
                            </div>
                        </Col>
                    ))}
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
