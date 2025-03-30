import { useEffect, useState } from 'react';
import { authApi } from '@/config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Flex, Form, Input, message, notification } from 'antd';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';

const RegisterModal = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    const [isSendingCode, setIsSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [formValues, setFormValues] = useState({ name: "", email: "", password: "", restaurant: { name: "" } });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const sendVerificationCode = async () => {
        if (!formValues.name || !formValues.email || !formValues.password || !formValues.restaurant.name) {
            message.error("Vui lòng điền đầy đủ thông tin trước khi gửi mã!");
            return;
        }

        setIsSendingCode(true);
        const resRegister = await authApi.callRegister(
            formValues.name,
            formValues.email,
            formValues.password,
            { name: formValues.restaurant.name }
        );
        setIsSendingCode(false);

        if (resRegister?.data) {
            setIsCodeSent(true);
            setCountdown(120);
            message.success("Mã xác nhận đã được gửi đến email của bạn!");
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: resRegister.message,
                duration: 5,
            });
        }
    };

    const onFinish = async () => {
        if (!formValues?.email || !verificationCode) {
            message.error("Vui lòng nhập mã xác nhận!");
            return;
        }

        setIsSubmit(true);
        const resVerifyCode = await authApi.callVerifyCode(formValues.email, verificationCode);
        setIsSubmit(false);

        if (resVerifyCode?.data) {
            setIsCodeVerified(true);
            message.success("Xác nhận mã thành công!");

            setIsSubmit(true);
            const { email, password } = formValues;

            try {
                const resLogin = await authApi.callLogin(email, password);
                if (resLogin?.data) {
                    localStorage.setItem("access_token", resLogin.data.access_token);
                    dispatch(setUserLoginInfo(resLogin.data.user));

                    message.success("Đăng nhập tài khoản thành công!");
                    navigate(callback || `/sales`, { replace: true });
                }
            } catch (error) {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: "Có lỗi xảy ra khi đăng nhập",
                    duration: 5,
                });
            } finally {
                setIsSubmit(false);
            }
        } else {
            notification.error({
                message: "Mã xác nhận không chính xác!",
                duration: 5,
            });
        }
    };

    return (
        < Form
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            onValuesChange={(changedValues, allValues) => setFormValues(allValues)}
        >
            <Form.Item
                labelCol={{ span: 24 }}
                label="Thông tin của bạn"
                name={['restaurant', 'name']}
                rules={[{ required: true, message: 'Tên nhà hàng không được để trống!' }]}
            >
                <Input placeholder="Tên nhà hàng" />
            </Form.Item>

            <Form.Item
                labelCol={{ span: 24 }}
                name="name"
                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
            >
                <Input placeholder="Họ tên" />
            </Form.Item>

            <Form.Item
                labelCol={{ span: 24 }}
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Email không được để trống!' }]}
            >
                <Input type='email' placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
                labelCol={{ span: 24 }}
                name="password"
                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
            >
                <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item required>
                <Flex gap={10}>
                    <Input
                        placeholder="Nhập mã xác nhận"
                        value={verificationCode}
                        disabled={!isCodeSent || isCodeVerified}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />

                    <Button
                        type="primary"
                        loading={isSendingCode}
                        onClick={sendVerificationCode}
                        disabled={isCodeVerified || countdown > 0 || !formValues.name || !formValues.email || !formValues.password || !formValues.restaurant.name}
                    >
                        {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi mã"}
                    </Button>
                </Flex>
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
                    Đăng ký
                </Button>
            </Form.Item>
        </Form>
    )
}

export default RegisterModal;