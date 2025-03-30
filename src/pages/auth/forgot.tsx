import { authApi } from '@/config/api';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import { Button, Flex, Form, Input, message, notification } from 'antd';

const ForgotPasswordModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const callback = params?.get("callback");

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [formValues, setFormValues] = useState({ email: "", password: "" });

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
    if (!formValues.email) {
      message.error("Vui lòng điền đầy đủ thông tin trước khi gửi mã!");
      return;
    }

    setIsSendingCode(true);
    const resForgot = await authApi.callForgotPassword(formValues.email);
    setIsSendingCode(false);

    if (resForgot?.data) {
      setIsCodeSent(true);
      setCountdown(120);
      message.success("Mã xác nhận đã được gửi đến email của bạn!");
    } else {
      notification.error({ message: "Có lỗi xảy ra", description: resForgot.message, duration: 5 });
    }
  };

  const confirmVerificationCode = async () => {
    if (!formValues.email || !verificationCode) {
      message.error("Vui lòng nhập mã xác nhận!");
      return;
    }
    setIsSubmit(true);
    const resVerifyCode = await authApi.callVerifyCode(formValues.email, verificationCode);
    setIsSubmit(false);
    if (resVerifyCode?.data) {
      setIsCodeConfirmed(true);
      message.success("Xác nhận mã thành công!");
    } else {
      notification.error({ message: "Mã xác nhận không chính xác!", duration: 5 });
    }
  };

  const onFinish = async () => {
    const { email, password } = formValues;
    setIsSubmit(true);

    try {
      const resLogin = await authApi.callLogin(email, password);
      if (resLogin?.data) {
        localStorage.setItem("access_token", resLogin.data.access_token);
        dispatch(setUserLoginInfo(resLogin.data.user));
        message.success("Đặt lại mật khẩu thành công!");
        navigate(callback || `/sales`, { replace: true });
      }
    } catch (error) {
      notification.error({ message: "Đăng nhập thất bại", description: "Có lỗi xảy ra khi đăng nhập", duration: 5 });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <Form name="basic" onFinish={onFinish} autoComplete="off" onValuesChange={(changedValues, allValues) => setFormValues(allValues)}>
      {!isCodeConfirmed && (
        <>
          <Form.Item labelCol={{ span: 24 }} label="Email" name="email" rules={[{ required: true, message: 'Email không được để trống!' }]}>
            <Input type='email' placeholder="Nhập email" />
          </Form.Item>
          <Form.Item required>
            <Flex gap={10}>
              <Input
                placeholder="Nhập mã xác nhận"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={!isCodeSent}
              />
              <Button type="primary" loading={isSendingCode} onClick={sendVerificationCode} disabled={countdown > 0 || !formValues.email}>{countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi mã"}</Button>
            </Flex>
          </Form.Item>
          <Form.Item>
            <Button block size="large" type="primary" onClick={confirmVerificationCode} loading={isSubmit}>Xác nhận mã</Button>
          </Form.Item>
        </>
      )}

      {isCodeConfirmed && (
        <>
          <Form.Item name="password" label="Mật khẩu mới" labelCol={{ span: 24 }} rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Nhập lại mật khẩu mới" labelCol={{ span: 24 }} rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}>
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button block size="large" htmlType="submit" loading={isSubmit} style={{ fontSize: 14, fontWeight: 600, borderRadius: 20, margin: '10px 0', border: "1px solid #ddd", color: "white", background: "linear-gradient(70.06deg, #2cccff -5%, #22dfbf 106%)" }}>Đặt lại mật khẩu</Button>
          </Form.Item>
        </>
      )}
    </Form>
  );
}

export default ForgotPasswordModal;
