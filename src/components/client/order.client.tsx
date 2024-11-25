import { Badge, Button, Card, Col, Input, message, Row, Skeleton, Table } from 'antd';
import { CoffeeOutlined, DeleteOutlined, GatewayOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom"

import '@/styles/client.table.scss';
import { authApi } from '@/config/api';
import { useAppDispatch } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchProductByRestaurant } from '@/redux/slice/productSlide';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import styles from 'styles/auth.module.scss';
import { colorMethod } from '../../config/utils';
import { colorMethod } from '@/config/utils';
import TextArea from 'antd/es/input/TextArea';

const OrderClient: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);

    const products = useSelector((state: RootState) => state.product.result);
    const diningTables = useSelector((state: RootState) => state.diningTable.result);

    const [isLoadingTab, setIsLoadingTab] = useState<boolean>(true);
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    useEffect(() => {
        if (rootRef && rootRef.current) {
            rootRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    useEffect(() => {
        dispatch(fetchProductByRestaurant({ query: '?page=1&size=100' }));
        dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100' }));
    }, [dispatch]);

    useEffect(() => {
        if (activeTabKey === 'tab1' || activeTabKey === 'tab2') {
            setIsLoadingTab(true);
            setTimeout(() => setIsLoadingTab(false), 900);
        }
    }, [activeTabKey]);

    useEffect(() => {
        setIsLoadingContent(true);
        const timer = setTimeout(() => {
            setIsLoadingContent(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [selectedLocation, selectedCategory]);

    const handleLogout = async () => {
        const res = await authApi.callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/login')
        }
    }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label:
                <label
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLogout()}
                >
                    Đăng xuất
                </label>,
            key: 'logout',
        },
    ];

    // <--- Change tab
    const diningTable = () => {
        const uniqueLocations = Array.from(
            new Set(diningTables.map(table => table.location))
        );

        const filteredTables = selectedLocation
            ? diningTables.filter(table => table.location === selectedLocation)
            : diningTables;

        return (
            <div className="container">
                <div className="container-content">
                    <Row gutter={[20, 22]}>
                        {isLoadingTab || isLoadingContent ? (
                            filteredTables.map((table, index) => (
                                <Col span={6} key={index}>
                                    <Skeleton active paragraph={{ rows: 2 }} />
                                </Col>
                            ))
                        ) : (
                            filteredTables.map((table) => (
                                <Col span={6} key={table.id}>
                                    <div className="table-item">
                                        <div className="item-card">
                                            <p className="item-card__title">{table.name}</p>
                                        </div>

                                        <div className="item-info">
                                        </div>
                                    </div>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>

                <div className="container-category">
                    {isLoadingTab ? (
                        <>
                            <Col span={6} >
                                <Skeleton active paragraph={{ rows: 1 }} />
                            </Col>

                            {uniqueLocations.map((table, index) => (
                                <Col span={6} key={index}>
                                    <Skeleton active paragraph={{ rows: 1 }} />
                                </Col>
                            ))}
                        </>
                    ) : (
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
                    )}
                </div>
            </div>
        );
    };

    const menu = () => {
        const uniqueCategories = Array.from(
            new Set(products.map(product => product.category))
        );

        const filteredProducts = selectedCategory
            ? products.filter(product => product.category === selectedCategory)
            : products;

        return (
            <div className="container">
                <div className="container-content">
                    <Row gutter={[20, 22]}>
                        {isLoadingTab || isLoadingContent ? (
                            filteredProducts.map((product, index) => (
                                <Col span={6} key={index}>
                                    <Skeleton active paragraph={{ rows: 5 }} />
                                </Col>
                            ))
                        ) : (
                            filteredProducts.map((product, index) => (
                                <Col span={6} key={product.id}>
                                    <div className="product-item">
                                        <div className="item-img">
                                            <img
                                                alt={`${product.name}`}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${product?.image}`}
                                            />
                                        </div>

                                        <div className="item-card">
                                            <p className="item-card__title">{product.name}</p>
                                            <p className="item-card__price">
                                                {(product.sellingPrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                đ
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>

                <div className="container-category">
                    {isLoadingTab ? (
                        <>
                            <Col span={6} >
                                <Skeleton active paragraph={{ rows: 1 }} />
                            </Col>

                            {uniqueCategories.map((category, index) => (
                                <Col span={6} key={index}>
                                    <Skeleton active paragraph={{ rows: 1 }} />
                                </Col>
                            ))}
                        </>
                    ) : (
                        <>
                            <div
                                className={`category-card ${selectedCategory === null ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <p className="category-card__name">Tất cả</p>
                            </div>

                            {uniqueCategories.map((category, index) => (
                                <div
                                    key={index}
                                    className={`category-card ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category || null)}
                                >
                                    <p className="category-card__name">
                                        {category === 'FOOD' ? "Đồ ăn"
                                            : category === 'DRINK' ? 'Đồ uống' : 'Khác'}
                                    </p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    }

    const contentList: Record<string, React.ReactNode> = {
        tab1: diningTable(),
        tab2: menu()
    };

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
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
    // end -->

    // <-- Table
    const dataSource = [
        {
            key: '1',
            name: 'Trà lài nhãn sen',
            age: 1,
            address: '50,000',
        },
        {
            key: '2',
            name: 'Trà vải khúc bạch',
            age: 2,
            address: '60,000',
        },
    ];

    const columns = [
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record: any, index: number) => (
                <>
                    <DeleteOutlined />
                    &nbsp; {value}
                </>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'age',
            key: 'age',
            align: "center" as const,
            width: 90,
            render: (value: string, record: any, index: number) => (
                <>
                    <MinusOutlined style={{ background: 'red', color: 'white', padding: '2px', borderRadius: '4px', cursor: 'pointer' }} />
                    &nbsp;  &nbsp;
                    {value}
                    &nbsp;  &nbsp;
                    <PlusOutlined style={{ background: 'red', color: 'white', padding: '2px', borderRadius: '4px', cursor: 'pointer' }} />
                </>
            )
        },
        {
            title: 'T.Tiền',
            dataIndex: 'address',
            key: 'address',
            align: "center" as const,
            width: 80,
        }
    ];
    // end -->

    return (
        <div className='layout-app' ref={rootRef}>
            {/* <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
                    Welcome Kim Long
                </Space>
            </Dropdown> */}

            <Row>
                <Col span={15}>
                    <Card
                        style={{ height: '100vh' }}
                        tabList={tabList}
                        activeTabKey={activeTabKey}
                        bordered={true}
                        onTabChange={onTabChange}
                    >
                        {contentList[activeTabKey]}
                    </Card>
                </Col>

                <Col span={9}>
                    <Card
                        style={{ height: '100vh' }}
                        title="Đơn hàng"
                        bordered={true}
                    >
                        <div className="container">
                            <Table
                                dataSource={dataSource}
                                columns={columns}
                                pagination={false}
                                size='small'
                                showHeader={false}
                            />

                            <div style={{ height: '167px' }}>
                                <div>
                                    <div style={{ fontSize: '15px', marginBottom: '4px' }}>
                                        Ghi chú
                                        <span style={{ color: '#acacac', fontSize: '14px' }}>&nbsp; (Tối đa 100 kí tự)</span>
                                    </div>

                                    <TextArea
                                        // value={value}
                                        // onChange={(e) => setValue(e.target.value)}
                                        maxLength={100}
                                        autoSize={{ minRows: 2, maxRows: 2 }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '10px 0', fontWeight: 600 }}>
                                    <div style={{ fontSize: '16px', color: '#393939' }}>
                                        Tổng tiền
                                        <span style={{ color: '#393939', fontSize: '15px' }}>&nbsp;(2 món)</span>
                                    </div>
                                    <div style={{ color: 'red', fontSize: '18px' }}>105,000</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '12px', fontWeight: 600 }}>
                                    <Button danger style={{ width: '40%', height: '36px', fontWeight: 600, fontSize: '14px', border: '1.8px solid #ff4d4f' }}>
                                        THÔNG BÁO
                                    </Button>

                                    <Button type="primary" style={{ width: '60%', height: '36px', background: '#439f14', fontSize: '14px', fontWeight: 600 }}>
                                        THANH TOÁN
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default OrderClient;