import { authApi } from "@/config/api";
import { useAppDispatch } from "@/redux/hooks";
import { Dropdown, message, Space } from "antd";
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import { setLogoutAction } from "@/redux/slice/accountSlide";

const DropdownMenu = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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
            label: <Link to={"/admin"}>Trang quản trị</Link>,
            key: "home",
        },
        {
            label: <Link to={"/sales"}>Bán hàng</Link>,
            key: "sales",
        },
        {
            label: <Link to={"/sales/kitchen"}>Bếp ăn</Link>,
            key: "kitchen",
        },
        {
            label: <Link to={"/sales/reception"}>Lễ tân</Link>,
            key: "reception",
        },
        {
            label: (
                <span style={{ cursor: "pointer" }} onClick={handleLogout}>
                    Đăng xuất
                </span>
            ),
            key: "logout",
        },
    ];

    return (
        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
            <Space style={{ cursor: "pointer" }}>
                Menu <MenuOutlined />
            </Space>
        </Dropdown>
    )
}

export default DropdownMenu;