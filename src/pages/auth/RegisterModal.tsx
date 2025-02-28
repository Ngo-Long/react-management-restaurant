import { Modal, Form, Input, Button, message, notification } from "antd";
import { useState } from "react";
import { authApi } from "@/config/api";
import { useNavigate } from "react-router-dom";

interface RegisterModalProps {
    open: boolean;
    onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (values: { name: string; email: string; password: string; restaurant: { name: string } }) => {
        setLoading(true);
        const { name, email, password, restaurant } = values;

        try {
            const res = await authApi.callRegister(name, email, password, { name: restaurant.name });
            setLoading(false);

            if (res?.data?.id) {
                message.success("Đăng ký tài khoản thành công!");
                onClose();
                navigate("/login");
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                    duration: 5,
                });
            }
        } catch (error: any) {
            setLoading(false);
            notification.error({
                message: "Lỗi đăng ký",
                description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.",
                duration: 5,
            });
        }
    };

    return (
        <Modal
            title="Đăng ký tài khoản"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form layout="vertical" onFinish={handleRegister}>
                <Form.Item
                    label="Tên nhà hàng"
                    name={["restaurant", "name"]}
                    rules={[{ required: true, message: "Tên nhà hàng không được để trống!" }]}
                >
                    <Input placeholder="Nhập tên nhà hàng" />
                </Form.Item>

                <Form.Item
                    label="Họ tên"
                    name="name"
                    rules={[{ required: true, message: "Họ tên không được để trống!" }]}
                >
                    <Input placeholder="Nhập họ tên" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RegisterModal;
