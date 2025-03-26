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
    CalendarOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
const { Header, Sider, Content } = Layout;
import { Badge, Button, Layout, Menu, Space, theme } from 'antd';

import DropdownMenu from '../share/dropdown.menu';
import React, { useState, useEffect } from 'react';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { useAppSelector } from '@/redux/hooks';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const LayoutAdmin: React.FC = () => {
    const navigate = useNavigate();
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
                    label: 'Trang chủ',
                    key: '/admin',
                    icon: <DashboardOutlined />,
                    onClick: () => navigate('/admin')
                },

                ...(viewRestaurant || ACL_ENABLE === 'false' ? [{
                    label: 'Nhà hàng',
                    key: '/admin/restaurant',
                    icon: <ShopOutlined />,
                    onClick: () => navigate('/admin/restaurant')
                }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: 'Người dùng',
                    key: '/admin/user',
                    icon: <UserOutlined />,
                    children: [
                        {
                            label: 'Nhân viên',
                            key: '/admin/user',
                            onClick: () => navigate('/admin/user')
                        },
                        {
                            label: 'Khách hàng',
                            key: '/admin/client',
                            onClick: () => navigate('/admin/client')
                        }
                    ]
                }] : []),

                ...(viewDiningTable || ACL_ENABLE === 'false' ? [{
                    label: 'Bàn ăn',
                    key: '/admin/dining-table',
                    icon: <GatewayOutlined />,
                    onClick: () => navigate('/admin/dining-table')
                }] : []),

                ...(viewProduct || ACL_ENABLE === 'false' ? [{
                    label: 'Thực đơn',
                    key: '/admin/product',
                    icon: <RadarChartOutlined />,
                    onClick: () => navigate('/admin/product')
                }] : []),

                ...(viewIngredient || ACL_ENABLE === 'false' ? [{
                    label: 'Nguyên liệu',
                    key: '/admin/ingredient',
                    icon: <ContainerOutlined />,
                    onClick: () => navigate('/admin/ingredient')
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: 'Lịch đặt',
                    key: '/admin/order',
                    icon: <CalendarOutlined />,
                    onClick: () => navigate('/admin/order')
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: 'Hóa đơn',
                    key: '/admin/invoice',
                    icon: <BarChartOutlined />,
                    onClick: () => navigate('/admin/invoice')
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/feedback'>Đánh giá</Link>,
                    key: '/admin/feedback',
                    icon: <BarChartOutlined />
                }] : []),

                ...(viewOrder || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/review'>Review</Link>,
                    key: '/admin/review',
                    icon: <BarChartOutlined />
                }] : []),

                ...(viewReceipt || ACL_ENABLE === 'false' ? [{
                    label: 'Biên lai',
                    key: '/admin/receipt',
                    icon: <LineChartOutlined />,
                    onClick: () => navigate('/admin/receipt')
                }] : []),

                ...(viewSupplier || ACL_ENABLE === 'false' ? [{
                    label: 'Nhà cung cấp',
                    key: '/admin/supplier',
                    icon: <PieChartOutlined />,
                    onClick: () => navigate('/admin/supplier')
                }] : []),

                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: 'Chức vụ',
                    key: '/admin/role',
                    icon: <ExceptionOutlined />,
                    onClick: () => navigate('/admin/role')
                }] : []),

                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: 'Quyền hạn',
                    key: '/admin/permission',
                    icon: <ApiOutlined />,
                    onClick: () => navigate('/admin/permission')
                }] : []),
            ];
            setMenuItems(full);
        }
    }, [permissions]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                theme='light'
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    position: 'relative',
                    textAlign: 'center',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)',
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
    );
};

export default LayoutAdmin;