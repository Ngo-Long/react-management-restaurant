import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Card, Col, message, Row } from 'antd';
import { CoffeeOutlined, GatewayOutlined } from '@ant-design/icons';

import { authApi } from '@/config/api';

import { useAppDispatch } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import '@/styles/client.table.scss';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchProductByRestaurant } from '@/redux/slice/productSlide';

const OrderClient: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);

    const diningTables = useSelector((state: RootState) => state.diningTable.result);
    const isTableFetching = useSelector((state: RootState) => state.diningTable.isFetching);

    const products = useSelector((state: RootState) => state.product.result);
    const isProductFetching = useSelector((state: RootState) => state.product.isFetching);

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
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
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
                        {filteredProducts.map((product) => (
                            <Col span={6} key={product.id}>
                                <div className="product-item">
                                    <div className="item-img">
                                        <img
                                            alt="${product.shortDesc}"
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
                        ))}
                    </Row>
                </div>

                <div className="container-category">
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

    return (
        <div className='layout-app' ref={rootRef}>
            {/* <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
                    Welcome Kim Long
                </Space>
            </Dropdown> */}

            <Row gutter={8}>
                <Col span={16}>
                    <Card
                        style={{ width: '100%', height: '97vh' }}
                        tabList={tabList}
                        activeTabKey={activeTabKey}
                        bordered={true}
                        onTabChange={onTabChange}
                    >
                        {contentList[activeTabKey]}
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        style={{ width: '100%', height: '97vh' }}
                        title="Đơn hàng"
                        bordered={true}
                    >
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default OrderClient;