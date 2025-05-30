import { 
    Form, 
    Input, 
    Button, 
    message, 
    notification 
} from 'antd';
import { useState } from 'react';
import { authApi } from '@/config/api';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';

const LoginModal = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isSubmit, setIsSubmit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        setIsLoading(true);

        setTimeout(async () => {
            try {
                const res = await authApi.callLogin(username, password);
                setIsSubmit(false);
                setIsLoading(false);

                if (res?.data) {
                    localStorage.setItem("access_token", res.data.access_token);
                    dispatch(setUserLoginInfo(res.data.user));

                    message.success("Đăng nhập tài khoản thành công!");
                    navigate(callback || `/sales`, { replace: true });
                } else {
                    notification.error({
                        message: "Đăng nhập thất bại",
                        description: "Vui lòng kiểm tra lại thông tin đăng nhập",
                        duration: 5,
                    });
                }
            } catch (error: any) {
                setIsSubmit(false);
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: error.message,
                    duration: 5,
                });
            }
        }, 2000);
    };

    return (
        <Form
            name="basic"
            autoComplete="off"
            onFinish={onFinish}
        >
            <Form.Item
                label="Email"
                name="username"
                labelCol={{ span: 24 }}
                rules={[
                    { required: true, message: 'Email không được để trống!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                ]}
            >
                <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
                label="Mật khẩu"
                name="password"
                labelCol={{ span: 24 }}
                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
            >
                <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item>
                <Button
                    block
                    size="large"
                    htmlType="submit"
                    loading={isSubmit}
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        borderRadius: 20,
                        margin: '10px 0',
                        border: "1px solid #ddd",
                        color: "white",
                        background: "linear-gradient(70.06deg, #2cccff -5%, #22dfbf 106%)",
                    }}
                >
                    Đăng nhập
                </Button>
            </Form.Item>
        </Form>
    )
}

export default LoginModal;