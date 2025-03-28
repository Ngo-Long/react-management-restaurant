import { useState } from "react";
import { Modal, Button, Input, Form, message, notification, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/config/api";
import { useDispatch } from "react-redux";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { UserOutlined, GoogleOutlined, FacebookOutlined, GithubOutlined } from "@ant-design/icons";

interface RegisterModalProps {
    open: boolean;
    onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: { name: string; email: string; password: string }) => {
        setIsSubmit(true);
        try {
            const res = await authApi.callRegister(values.name, values.email, values.password, { name: values.name });

            if (res?.data?.id) {
                message.success("Đăng ký thành công! Đang đăng nhập...");

                const loginRes = await authApi.callLogin(values.email, values.password);
                if (loginRes?.data?.access_token) {
                    localStorage.setItem("access_token", loginRes.data.access_token);
                    dispatch(setUserLoginInfo(loginRes.data.user));
                    message.success("Đăng nhập thành công!");
                    navigate("/dashboard"); 
                    onClose();
                } else {
                    notification.error({ message: "Đăng nhập thất bại", description: "Không thể tự động đăng nhập." });
                }
            } else {
                notification.error({
                    message: "Đăng ký thất bại",
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                });
            }
        } catch (error: any) {
            notification.error({ message: "Có lỗi xảy ra", description: error.message });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Modal title="Đăng ký tài khoản" open={open} onCancel={onClose} footer={null} width={400}>
            <p style={{ color: "red", textAlign: "center" }}>
                Mỗi người nên sử dụng riêng một tài khoản, tài khoản nhiều người sử dụng chung sẽ bị khóa.
            </p>

            {!showForm && (
                <>
                    <Button icon={<UserOutlined />} style={{ width: "100%", marginBottom: 10 }} onClick={() => setShowForm(true)}>
                        Sử dụng email / số điện thoại
                    </Button>

                    <Button icon={<GoogleOutlined />} style={{ width: "100%", marginBottom: 10 }}>
                        Đăng ký với Google
                    </Button>
                    <Button icon={<FacebookOutlined />} style={{ width: "100%", marginBottom: 10 }}>
                        Đăng ký với Facebook
                    </Button>
                    <Button icon={<GithubOutlined />} style={{ width: "100%", marginBottom: 10 }}>
                        Đăng ký với Github
                    </Button>
                </>
            )}

            {showForm && (
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item label="Email / Số điện thoại" name="email" rules={[{ required: true, message: "Vui lòng nhập email hoặc số điện thoại!" }]}>
                        <Input placeholder="Nhập email hoặc số điện thoại" />
                    </Form.Item>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isSubmit} style={{ width: "100%" }}>
                            Đăng ký 
                        </Button>
                    </Form.Item>
                </Form>
            )}

            <div style={{ textAlign: "center", marginTop: 15 }}>
                <span>Đã có tài khoản? </span>
                <a onClick={() => navigate("/login")} style={{ color: "#1890ff" }}>Đăng nhập</a>
            </div>
        </Modal>
    );
};

export default RegisterModal;
