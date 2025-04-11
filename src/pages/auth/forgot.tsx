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
      message.error("Vui lòng nhập email trước khi gửi mã!");
      return;
    }

    try {
      setIsSendingCode(true);
      const res = await authApi.callForgotPassword(formValues.email);
      if (+res?.statusCode == 400) {
        notification.error({ message: "Email không tồn tại", duration: 5 });
      } else {
        setIsCodeSent(true);
        setCountdown(120);
        message.success("Mã xác nhận đã được gửi đến email của bạn!");
      }
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra", duration: 5 });
    } finally {
      setIsSendingCode(false);
    }
  };

  const confirmVerificationCode = async () => {
    if (!formValues.email || !verificationCode) {
      message.error("Vui lòng nhập mã xác nhận!");
      return;
    }

    try {
      setIsSubmit(true);
      const res = await authApi.callVerifyCode(formValues.email, verificationCode);
      if (res?.data) {
        setFormValues(prev => ({ ...prev, email: formValues.email }));
        setIsCodeConfirmed(true);
        message.success("Xác nhận mã thành công!");
      }
    } catch (error) {
      notification.error({ message: "Mã xác nhận không chính xác!", duration: 5 });
    } finally {
      setIsSubmit(false);
    }
  };

  const onFinish = async () => {
    const { email, password } = formValues;
    setIsSubmit(true);

    try {
      await authApi.callChangePassword(email, password);
      const res = await authApi.callLogin(email, password);
      if (res?.data) {
        localStorage.setItem("access_token", res.data.access_token);
        dispatch(setUserLoginInfo(res.data.user));
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
    <Form
      name="basic"
      autoComplete="off"
      onFinish={onFinish}
      onValuesChange={(changedValues, allValues) => {
        setFormValues(prev => ({ ...prev, ...allValues }));
      }}
    >
      {!isCodeConfirmed && (
        <>
          <Form.Item
            name="email"
            label="Email"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: 'Email không được để trống!' }]}
          >
            <Input type='email' placeholder="Nhập email" />
          </Form.Item>

          <Form.Item required>
            <Flex gap={10}>
              <Input
                disabled={!isCodeSent}
                value={verificationCode}
                placeholder="Nhập mã xác nhận"
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button
                type="primary"
                loading={isSendingCode}
                onClick={sendVerificationCode}
                disabled={countdown > 0 || !formValues.email}
              >
                {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi mã"}
              </Button>
            </Flex>
          </Form.Item>

          <Form.Item>
            <Button
              block
              size="large"
              loading={isSubmit}
              onClick={confirmVerificationCode}
              style={{
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 20,
                color: "white",
                margin: '10px 0',
                border: "1px solid #ddd",
                background: "linear-gradient(70.06deg, #2cccff -5%, #22dfbf 106%)"
              }}
            >
              Xác nhận mã
            </Button>
          </Form.Item>
        </>
      )}

      {isCodeConfirmed && (
        <>
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            labelCol={{ span: 24 }}
            rules={[
              { required: true, message: 'Mật khẩu không được để trống!' },
              { min: 4, message: 'Mật khẩu phải có ít nhất 4 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            dependencies={['password']}
            labelCol={{ span: 24 }}
            rules={[
              { required: true, message: 'Mật khẩu không được để trống!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
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
                color: "white",
                margin: '10px 0',
                border: "1px solid #ddd",
                background: "linear-gradient(70.06deg, #2cccff -5%, #22dfbf 106%)"
              }}
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </>
      )}
    </Form>
  );
}

export default ForgotPasswordModal;
