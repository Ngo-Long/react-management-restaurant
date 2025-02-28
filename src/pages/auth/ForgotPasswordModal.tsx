import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [form] = Form.useForm();
  const correctOTP = "123456"; 

  const handleNext = () => {
    form.validateFields().then(() => setStep(2));
  };

  const handleVerifyOTP = () => {
    form.validateFields().then((values) => {
      if (values.otp === correctOTP) {
        setStep(3);
      } else {
        message.error("Mã OTP không chính xác!");
      }
    });
  };

  const handleResetPassword = () => {
    form.validateFields().then(() => {
      message.success("Mật khẩu đã được thay đổi thành công!");
      onClose();
      setStep(1);
      form.resetFields();
    });
  };

  return (
    <Modal title="Quên mật khẩu" open={open} onCancel={onClose} footer={null}>
      {step === 1 && (
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>
          <Button type="primary" block onClick={handleNext}>
            Gửi mã OTP
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
          >
            <Input placeholder="Nhập mã OTP" />
          </Form.Item>
          <Button type="primary" block onClick={handleVerifyOTP}>
            Xác nhận
          </Button>
        </Form>
      )}

      {step === 3 && (
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Button type="primary" block onClick={handleResetPassword}>
            Đổi mật khẩu
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
