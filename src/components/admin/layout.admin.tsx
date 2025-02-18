import {
    ApiOutlined,
    BugOutlined,
    ShopOutlined,
    UserOutlined,
    GatewayOutlined,
    BarChartOutlined,
    DotChartOutlined,
    PieChartOutlined,
    MenuFoldOutlined,
    ContainerOutlined,
    DashboardOutlined,
    ExceptionOutlined,
    LineChartOutlined,
    MenuUnfoldOutlined,
    RadarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
const { Header, Sider, Content } = Layout;
import { Button, Layout, Menu, Space, theme } from 'antd';

import DropdownMenu from '../share/dropdown.menu';
import React, { useState, useEffect } from 'react';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { useAppSelector } from '@/redux/hooks';
import { Link, Outlet, useLocation } from "react-router-dom";

const LayoutAdmin: React.FC = () => {
    const location = useLocation();
    const { token: { colorBgContainer } } = theme.useToken();
    const permissions = useAppSelector(state => state.account.user.role.permissions);

    const [collapsed, setCollapsed] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);
    const [activeMenu, setActiveMenu] = useState('');


    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewRestaurant = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.RESTAURANTS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.RESTAURANTS.GET_PAGINATE.method
            )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const viewDiningTable = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.DININGTABLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.DININGTABLES.GET_PAGINATE.method
            )

            const viewProduct = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PRODUCTS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.PRODUCTS.GET_PAGINATE.method
            )

            const viewIngredient = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.INGREDIENTS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.INGREDIENTS.GET_PAGINATE.method
            )

            const viewOrder = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ORDERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ORDERS.GET_PAGINATE.method
            )

            const viewReceipt = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.RECEIPTS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.RECEIPTS.GET_PAGINATE.method
            )

            const viewSupplier = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.SUPPLIERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.SUPPLIERS.GET_PAGINATE.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const full = [
                {
                    label: <Link to='/admin'>Trang chủ</Link>,
                    key: '/admin',
                    icon: <DashboardOutlined />
                },

                ...(viewRestaurant || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/restaurant'>Nhà hàng</Link>,
                    key: '/admin/restaurant',
                    icon: <ShopOutlined />
                }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>Người dùng</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),

                ...(viewDiningTable || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/dining-table'>Bàn ăn</Link>,
                    key: '/admin/dining-table',
                    icon: <GatewayOutlined />
                }] : []),

                ...(viewProduct || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/product'>Thực đơn</Link>,
                    key: '/admin/product',
                    icon: <RadarChartOutlined />
                }] : []),

                ...(viewIngredient || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/ingredient'>Nguyên liệu</Link>,
                    key: '/admin/ingredient',
                    icon: <ContainerOutlined />
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/order'>Đơn hàng</Link>,
                    key: '/admin/order',
                    icon: <DotChartOutlined />
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/invoice'>Hóa đơn</Link>,
                    key: '/admin/invoice',
                    icon: <BarChartOutlined />
                }] : []),

                ...(viewReceipt || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/receipt'>Biên lai</Link>,
                    key: '/admin/receipt',
                    icon: <LineChartOutlined />
                }] : []),

                ...(viewSupplier || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/supplier'>Nhà cung cấp</Link>,
                    key: '/admin/supplier',
                    icon: <PieChartOutlined />
                }] : []),

                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Chức vụ</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),

                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Quyền hạn</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),
            ];

            setMenuItems(full);
        }
    }, [permissions]);



    return (
        <>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    theme='light'
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{
                        position: 'relative',
                        textAlign: 'center',
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)'
                    }}
                >
                    <div style={{ height: 40, marginTop: 24, textAlign: 'center' }}>
                        <BugOutlined /> ADMIN
                    </div>

                    <Menu
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                    />

                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    />
                </Sider>

                <Layout>
                    <Header style={{ padding: 0, background: colorBgContainer, position: "relative", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}>
                        <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
                            <DropdownMenu />
                        </Space>
                    </Header>

                    <Content style={{ margin: '16px 16px', height: "calc(100vh - 10%)" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default LayoutAdmin;