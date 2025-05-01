import {
    Card,
    Flex,
    Space,
    Button,
    message,
    notification,
    Tag,
} from 'antd';
import { Table } from 'antd/lib';
import { ColumnType } from 'antd/es/table';

import '@/styles/client.table.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { orderDetailApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useState } from 'react';
import { IOrderDetail } from '../../../types/backend';
import DropdownMenu from '@/components/share/dropdown.menu';
import { fetchOrderDetailsByRestaurant } from '@/redux/slice/orderDetailSlide';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchProductsByRestaurant } from '@/redux/slice/productSlide';
import { ModalReasonCancel } from './container';
dayjs.extend(relativeTime);

const KitchenClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('');
    const [currentData, setCurrentData] = useState<IOrderDetail | null>(null);
    const products = useSelector((state: RootState) => state.product.result);
    const orderDetails = useSelector((state: RootState) => state.orderDetail.result);
    const stations = [...new Set(products.map(product => product.station))].filter(Boolean);

    useEffect(() => {
        fetchData();
    }, [dispatch, isModalOpen]);

    useEffect(() => {
        if (stations.length > 0 && !activeTabKey) {
            setActiveTabKey(stations[0]);
        }
    }, [stations, activeTabKey]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await dispatch(fetchProductsByRestaurant({ query: '' }));
            await dispatch(fetchOrderDetailsByRestaurant({ query: "filter=status~'PENDING'&sort=createdDate,asc" }));
        } catch (error: any) {
            notification.error({ message: "Lỗi khi tải dữ liệu", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderDetail: IOrderDetail, status: 'CANCELED' | 'CONFIRMED') => {
        try {
            orderDetailApi.callUpdate({ ...orderDetail, status });
            message.success(`Xác nhận thành công.`);
            fetchData();
        } catch (error: any) {
            notification.error({ message: "Lỗi cập nhật trạng thái.", description: error.message });
        }
    };

    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: 'Tên món ăn',
            key: 'name',
            render: (_, record) => (
                <div className='btn-name'>
                    {`${record.product?.name} (${record.unit?.name})`}
                    {record?.note && (
                        <>
                            <br />
                            {`⤷ ${record.note}`}
                        </>
                    )}
                </div>
            )
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            dataIndex: 'quantity',
            align: 'center',
            width: 100
        },
        {
            title: 'Phòng/bàn',
            key: 'diningTables',
            width: 200,
            render: (_, record) => (
                <Flex wrap gap="6px 0" >
                    {(record.diningTables as string[]).map((table, index) => (
                        <Tag
                            key={index}
                            style={{
                                fontSize: '14px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                            }}
                        >
                            {table}
                        </Tag>
                    ))}
                </Flex>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'lastModifiedDate',
            align: 'center',
            width: 200,
            render: (_, record) => {
                return (
                    <>
                        {dayjs(record.lastModifiedDate).format('HH:mm:ss - DD/MM/YYYY')} <br />
                        <small>{`( ${dayjs(record.lastModifiedDate).fromNow()} )`}</small>
                    </>
                );
            }
        },
        {
            title: 'Tác vụ',
            align: "center",
            width: 200,
            render: (_, record) => (
                <Flex wrap gap="small">
                    <Button danger onClick={() => {
                        setCurrentData(record);
                        setIsModalOpen(true);
                    }}>
                        Xóa
                    </Button>
                    <Button className="btn-green" onClick={() => handleUpdateStatus(record, 'CONFIRMED')}>
                        Hoàn thành
                    </Button>
                </Flex>
            ),
        },
    ];

    const contentList: Record<string, React.ReactNode> = stations.reduce((acc, station, index) => {
        acc[station] = (
            <Table<IOrderDetail>
                size='large'
                key={`kitchen-${index}`}
                loading={loading}
                columns={columns}
                pagination={false}
                className="order-table"
                rowClassName="order-table-row"
                rowKey={(record) => record.id || ''}
                scroll={{ y: 'calc(100vh - 160px)' }}
                dataSource={orderDetails.filter(order => order.product?.station === station)}
            />
        );
        return acc;
    }, {} as Record<string, React.ReactNode>);

    return (
        <>
            <Card
                tabList={stations.map(station => ({ key: station, tab: station }))}
                bordered={true}
                className={'no-select'}
                activeTabKey={activeTabKey}
                tabBarExtraContent={
                    <Space>
                        <Button type='primary' onClick={() => fetchData()}>
                            Lịch sử
                        </Button>
                        <Button type='primary' onClick={() => fetchData()}>
                            Nguyên liệu
                        </Button>
                        <DropdownMenu />
                    </Space>
                }
                onTabChange={(key) => setActiveTabKey(key)}
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    overflow: 'hidden'
                }}
            >
                {contentList[activeTabKey]}
            </Card>

            <ModalReasonCancel
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                currentData={currentData}
                setCurrentData={setCurrentData}
            />
        </>
    );
};

export default KitchenClient;
