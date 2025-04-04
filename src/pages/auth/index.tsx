import LoginModal from './login';
import { useState } from "react";
import RegisterModal from './register';
import { useDispatch } from 'react-redux';
import ForgotPasswordModal from './forgot';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined } from "@ant-design/icons";
import { Modal, Button, Typography, message } from "antd";
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import { authApi } from '@/config/api';

const { Text, Title } = Typography;

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    isLogin: boolean;
    setIsLogin: (isLogin: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, isLogin, setIsLogin }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
    const isForgotPassword = showForgotPasswordForm;

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
            `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/google`,
            'oauth2_popup',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=no`
        );

        const checkPopup = setInterval(() => {
            try {
                if (!popup || popup.closed) {
                    clearInterval(checkPopup);
                    return;
                }

                // Popup redirect về trang
                if (popup.location.href.startsWith(window.location.origin)) {
                    clearInterval(checkPopup);

                    // Xử lý token từ URL (nếu cần)
                    const popupParams = new URLSearchParams(popup.location.search);
                    const accessToken = popupParams.get('access_token');
                    const email = popupParams.get('email');

                    if (!accessToken || !email) {
                        message.error('Thiếu thông tin xác thực từ Google');
                        popup.close();
                        return;
                    }

                    try {
                        const user = authApi.callFetchUser(email);
                        console.log(user);
                        dispatch(setUserLoginInfo(user));
                        localStorage.setItem('access_token', accessToken);

                        message.success(`Đăng nhập thành công!`);
                        navigate('/sales');
                        popup.close();
                    } catch (error) {
                        console.error('Lỗi xử lý thông tin:', error);
                        message.error('Lỗi xử lý thông tin đăng nhập');
                        popup.close();
                    }
                }
            } catch (e) {
                // Bỏ qua lỗi cross-origin khi kiểm tra popup
            }
        }, 500);
    };

    return (
        <Modal
            centered
            open={open}
            width={480}
            footer={null}
            onCancel={() => {
                setShowLoginForm(false);
                setShowRegisterForm(false);
                setShowForgotPasswordForm(false);
                onClose();
            }}
            bodyStyle={{
                padding: "30px 60px 20px",
                textAlign: "center",
                borderRadius: "12px",
                background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
                maxHeight: "470px",
                overflowY: "auto",
                scrollbarWidth: "none",
            }}
            title={(showLoginForm || showRegisterForm || showForgotPasswordForm) && (
                <Button
                    type="text"
                    onClick={() => {
                        setShowLoginForm(false);
                        setShowRegisterForm(false);
                        setShowForgotPasswordForm(false);
                        if (!isForgotPassword) setIsLogin(true);
                    }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        fontSize: 16,
                        color: "#ff4d4f",
                        marginTop: '8px',
                    }}
                >
                    <LeftOutlined /> Quay lại
                </Button>
            )}
        >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Title level={2} style={{ color: "#ff4d4f", margin: '0 0 4px', fontWeight: 700 }}>Rservice</Title>
                <Title level={4} style={{ margin: '0 0 25px' }}>
                    {isForgotPassword
                        ? "Quên mật khẩu"
                        : isLogin
                            ? "Đăng nhập tài khoản"
                            : "Đăng ký tài khoản"}
                </Title>
            </div>

            {!showLoginForm && !showRegisterForm && !showForgotPasswordForm && (
                <>
                    <Button
                        block
                        size="large"
                        style={{
                            fontSize: 14,
                            borderRadius: 20,
                            marginBottom: 10,
                            border: "1px solid #ddd",
                            position: "relative",
                        }}
                        onClick={isLogin ? () => setShowLoginForm(true) : () => setShowRegisterForm(true)}
                    >
                        <img
                            style={{ position: "absolute", left: 12 }}
                            src="data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10%2011c-2.67%200-8%201.34-8%204v3h16v-3c0-2.66-5.33-4-8-4m0-9C7.79%202%206%203.79%206%206s1.79%204%204%204%204-1.79%204-4-1.79-4-4-4m0%2010.9c2.97%200%206.1%201.46%206.1%202.1v1.1H3.9V15c0-.64%203.13-2.1%206.1-2.1m0-9a2.1%202.1%200%20110%204.2%202.1%202.1%200%20010-4.2'%20fill-opacity='.54'%20fill-rule='evenodd'%3e%3c/path%3e%3c/svg%3e"
                            alt="Email Logo"
                        />
                        {isLogin ? "Đăng nhập tài khoản email" : "Đăng ký tài khoản email"}
                    </Button>

                    <Button
                        block
                        size="large"
                        style={{
                            fontSize: 14,
                            borderRadius: 20,
                            marginBottom: 10,
                            border: "1px solid #ddd",
                            position: "relative",
                        }}
                    >
                        <img
                            style={{ position: "absolute", left: 12 }}
                            width={20}
                            height={20}
                            src="https://www.svgrepo.com/show/524807/phone.svg"
                            alt="Phone Logo"
                        />
                        {isLogin ? "Đăng nhập số điện thoại" : "Đăng ký số điện thoại"}
                    </Button>

                    <Button
                        block
                        size="large"
                        onClick={handleGoogleLogin}
                        style={{
                            position: "relative",
                            fontSize: 14,
                            borderRadius: 20,
                            marginBottom: 10,
                            border: "1px solid #ddd",
                        }}
                    >
                        <img
                            style={{ position: "absolute", left: 12 }}
                            src="data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20transform=''%3e%3cg%20fill-rule='evenodd'%3e%3cpath%20d='m17.64%209.2a10.341%2010.341%200%200%200%20-.164-1.841h-8.476v3.481h4.844a4.14%204.14%200%200%201%20-1.8%202.716v2.264h2.909a8.777%208.777%200%200%200%202.687-6.62z'%20fill='%234285f4'/%3e%3cpath%20d='m9%2018a8.592%208.592%200%200%200%205.956-2.18l-2.909-2.258a5.43%205.43%200%200%201%20-8.083-2.852h-3.007v2.332a9%209%200%200%200%208.043%204.958z'%20fill='%2334a853'/%3e%3cpath%20d='m3.964%2010.71a5.321%205.321%200%200%201%200-3.42v-2.332h-3.007a9.011%209.011%200%200%200%200%208.084z'%20fill='%23fbbc05'/%3e%3cpath%20d='m9%203.58a4.862%204.862%200%200%201%203.44%201.346l2.581-2.581a8.649%208.649%200%200%200%20-6.021-2.345%209%209%200%200%200%20-8.043%204.958l3.007%202.332a5.364%205.364%200%200%201%205.036-3.71z'%20fill='%23ea4335'/%3e%3c/g%3e%3cpath%20d='m0%200h18v18h-18z'%20fill='none'/%3e%3c/g%3e%3c/svg%3e"
                            alt="Google Logo"
                        />
                        {isLogin ? "Đăng nhập với Google" : "Đăng ký với Google"}
                    </Button>

                    <Button
                        block
                        size="large"
                        style={{
                            fontSize: 14,
                            borderRadius: 20,
                            marginBottom: 10,
                            border: "1px solid #ddd",
                            position: "relative",
                        }}
                    >
                        <img
                            style={{ position: "absolute", left: 12 }}
                            src="data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='m17.007%200h-16.014a.993.993%200%200%200%20-.993.993v16.014a.993.993%200%200%200%20.993.993h8.628v-6.961h-2.343v-2.725h2.343v-2a3.274%203.274%200%200%201%203.494-3.591%2019.925%2019.925%200%200%201%202.092.106v2.43h-1.428c-1.13%200-1.35.534-1.35%201.322v1.73h2.7l-.351%202.725h-2.364v6.964h4.593a.993.993%200%200%200%20.993-.993v-16.014a.993.993%200%200%200%20-.993-.993z'%20fill='%234267b2'%20/%3e%3cpath%20d='m28.586%2024.041v-6.961h2.349l.351-2.725h-2.7v-1.734c0-.788.22-1.322%201.35-1.322h1.443v-2.434a19.924%2019.924%200%200%200%20-2.095-.106%203.27%203.27%200%200%200%20-3.491%203.591v2h-2.343v2.73h2.343v6.961z'%20fill='%23fff'%20transform='translate(-16.172%20-6.041)'%20/%3e%3c/svg%3e"
                            alt="Facebook Logo"
                        />
                        {isLogin ? "Đăng nhập với Facebook" : "Đăng ký với Facebook"}
                    </Button>
                </>
            )}

            {/* Show form */}
            {showLoginForm && (<LoginModal />)}
            {showRegisterForm && (<RegisterModal />)}
            {showForgotPasswordForm && (<ForgotPasswordModal />)}

            <div style={{ textAlign: "center", margin: '20px 0 10px' }}>
                {isLogin ? (
                    <>
                        <Text>Bạn chưa có tài khoản? </Text>
                        <span
                            style={{ color: "#ff4d4f", cursor: "pointer", textDecoration: 'underline' }}
                            onClick={() => {
                                setIsLogin(false);
                                setShowLoginForm(false);
                                setShowRegisterForm(false);
                                setShowForgotPasswordForm(false);
                            }}
                        >
                            Đăng ký
                        </span>
                    </>
                ) : (
                    <>
                        <Text>Bạn đã có tài khoản? </Text>
                        <span
                            style={{ color: "#ff4d4f", cursor: "pointer", textDecoration: 'underline' }}
                            onClick={() => {
                                setIsLogin(true);
                                setShowLoginForm(false);
                                setShowRegisterForm(false);
                                setShowForgotPasswordForm(false);
                            }}
                        >
                            Đăng nhập
                        </span>
                    </>
                )}
            </div>

            <div style={{ textAlign: "center", marginBottom: 10 }}>
                <span
                    onClick={() => {
                        setShowLoginForm(false);
                        setShowRegisterForm(false);
                        setShowForgotPasswordForm(true);
                    }}
                    style={{ color: "#ff4d4f", textDecoration: 'underline', cursor: 'pointer' }}
                >
                    Quên mật khẩu?
                </span>
            </div>
        </Modal>
    );
};

export default AuthModal;