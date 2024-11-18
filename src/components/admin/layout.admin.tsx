import React, { useState, useEffect } from 'react';
import {
    ApiOutlined,
    AppstoreOutlined,
    BugOutlined,
    ExceptionOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { Avatar, Button, Dropdown, Flex, Layout, Menu, message, Space, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from 'antd';
import { authApi } from '../../config/api';
import { setLogoutAction } from '../../redux/slice/accountSlide';
import { isMobile } from 'react-device-detect';
import { ALL_PERMISSIONS } from '../../config/permissions';

const { Header, Sider, Content } = Layout;

const LayoutAdmin: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token: { colorBgContainer } } = theme.useToken();

    const [collapsed, setCollapsed] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);
    const [activeMenu, setActiveMenu] = useState('');

    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.account.user);
    const permissions = useAppSelector(state => state.account.user.role.permissions);


    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            // const viewCompany = permissions?.find(item =>
            //     item.apiPath === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.apiPath
            //     && item.method === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.method
            // )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            // const viewJob = permissions?.find(item =>
            //     item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath
            //     && item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
            // )

            // const viewResume = permissions?.find(item =>
            //     item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath
            //     && item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
            // )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            // const viewNews = permissions?.find(item =>
            //     item.apiPath === ALL_PERMISSIONS.NEWS.GET_PAGINATE.apiPath
            //     && item.method === ALL_PERMISSIONS.NEWS.GET_PAGINATE.method
            // )

            const full = [
                {
                    label: <Link to='/admin'>Dashboard</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },

                // ...(viewCompany || ACL_ENABLE === 'false' ? [{
                //     label: <Link to='/admin/company'>Company</Link>,
                //     key: '/admin/company',
                //     icon: <BankOutlined />,
                // }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>User</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),

                // ...(viewJob || ACL_ENABLE === 'false' ? [{
                //     label: <Link to='/admin/job'>Job</Link>,
                //     key: '/admin/job',
                //     icon: <ScheduleOutlined />
                // }] : []),

                // ...(viewResume || ACL_ENABLE === 'false' ? [{
                //     label: <Link to='/admin/resume'>Resume</Link>,
                //     key: '/admin/resume',
                //     icon: <AliwangwangOutlined />
                // }] : []),

                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Permission</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),

                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Role</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),

                // ...(viewNews || ACL_ENABLE === 'false' ? [{
                //     label: <Link to='/admin/news'>News</Link>,
                //     key: '/admin/news',
                //     icon: <ContainerOutlined />
                // }] : []),

            ];

            setMenuItems(full);
        }
    }, [permissions]);

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

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
                        theme="light"
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        onClick={({ key }) => {
                            navigate(key);
                        }}
                        items={[
                            {
                                key: '/admin',
                                icon: <HomeOutlined />,
                                label: <Link to='/admin'>Trang chủ</Link>,
                            },
                            {
                                key: '/admin/user',
                                icon: <UserOutlined />,
                                label: <Link to='/admin/user'>Người dùng</Link>,
                            }
                        ]}
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
                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
                                Welcome Admin
                            </Space>
                        </Dropdown>
                    </Header>

                    <Content style={{ margin: '16px 16px', height: "calc(100vh - 100px)" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default LayoutAdmin;