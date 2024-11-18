import React, { useState } from 'react';
import {
    BugOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Flex, Layout, Menu, theme } from 'antd';
import { Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const LayoutAdmin: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Sider
                theme='light'
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{ position: 'relative', height: '100vh', textAlign: 'center' }}
            >
                <div style={{ height: 40, marginTop: 24, textAlign: 'center' }}>
                    <BugOutlined /> ADMIN
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        {
                            key: '1',
                            icon: <HomeOutlined />,
                            label: 'Trang chủ',
                        },
                        {
                            key: '2',
                            icon: <UserOutlined />,
                            label: 'Người dùng',
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
                <Header style={{ padding: 0, background: colorBgContainer }}>

                </Header>

                <Content
                    style={{
                        margin: '16px 16px',
                        padding: 24,
                        height: "calc(100vh - 100px)",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    Content
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;