import { useState } from "react";
import { authApi } from "@/config/api";
import { useDispatch } from "react-redux";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Modal, Form, Input, Button, message, notification, Divider } from "antd";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const callback = params?.get("callback");

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsSubmit(true);
    setLoading(true);
    try {
      const res = await authApi.callLogin(values.email, values.password);
      setIsSubmit(false);
      setLoading(false);
      if (res?.data) {
        localStorage.setItem("access_token", res.data.access_token);
        dispatch(setUserLoginInfo(res.data.user));
        message.success("Đăng nhập thành công!");
        onClose();
        navigate(callback || `/sales`, { replace: true });
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description: "Vui lòng kiểm tra lại thông tin đăng nhập",
        });
      }
    } catch (error: any) {
      setIsSubmit(false);
      setLoading(false);
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Modal
        title="Đăng nhập"
        open={open}
        onCancel={onClose}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmit} block>
            Đăng nhập
          </Button>

          <Button type="link" block onClick={() => setForgotPasswordOpen(true)}>
            Quên mật khẩu?
          </Button>

          <Divider>Hoặc</Divider>
          <p className="text text-normal">
            Chưa có tài khoản? <Link to="/register">Đăng Ký</Link>
          </p>
        </Form>
      </Modal>

      {/* <ForgotPasswordModal open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} /> */}
    </>
  );
};

export default LoginModal;
