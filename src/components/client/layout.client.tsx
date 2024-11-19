import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Header } from 'antd/es/layout/layout';
import { Dropdown, message, Space, theme } from 'antd';

import { authApi } from '@/config/api';

import { useAppDispatch } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';

const LayoutClient: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const rootRef = useRef<HTMLDivElement>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const { token: { colorBgContainer } } = theme.useToken();

    useEffect(() => {
        if (rootRef && rootRef.current) {
            rootRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

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
        <div className='layout-app' ref={rootRef}>
            <Header style={{ padding: 0, background: colorBgContainer, position: "relative", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}>
                <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                    <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
                        Welcome Kim Long
                    </Space>
                </Dropdown>
            </Header>

            {/* <div className={styles['content-app']}>
          <Outlet context={[searchTerm, setSearchTerm]} />
        </div> */}

        </div>
    )
}

export default LayoutClient;