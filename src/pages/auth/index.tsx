import LoginModal from './login';
import { useEffect, useState } from "react";
import { authApi } from '@/config/api';
import RegisterModal from './register';
import { useDispatch } from 'react-redux';
import ForgotPasswordModal from './forgot';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined } from "@ant-design/icons";
import { Modal, Button, Typography, message } from "antd";
import { setUserLoginInfo } from '@/redux/slice/accountSlide';

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
    const [activeForm, setActiveForm] = useState<'login' | 'register' | 'forgot' | null>(null);

    const handleOAuthLogin = (provider: 'google' | 'facebook' | 'zalo') => {
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popupName = `oauth2_popup_${Date.now()}`;
        let authUrl = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/${provider}`;

        if (provider === 'zalo') {
            authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${import.meta.env.VITE_ZALO_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth2/redirect/zalo')}`;
        }

        const popup = window.open(
            authUrl,
            popupName,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=no`
        );

        console.log(authUrl);

        if (!popup) {
            message.error('Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup để tiếp tục!');
            return;
        }

        const checkPopup = setInterval(async () => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    return;
                }

                if (popup.location.href.includes('/oauth2/redirect') || popup.location.href.includes('access_token')) {
                    clearInterval(checkPopup);
                    handleOAuthCallback(popup);
                }
            } catch (e) {
                // Bỏ qua lỗi cross-origin
            }
        }, 500);

        const cleanup = () => {
            clearInterval(checkPopup);
            if (popup && !popup.closed) popup.close();
        };

        return cleanup;
    };

    const handleOAuthCallback = async (popup: Window | null) => {
        if (popup == null) {
            return;
        }

        try {
            const popupUrl = new URL(popup.location.href);
            const accessToken = popupUrl.searchParams.get('access_token');
            const email = popupUrl.searchParams.get('email');

            if (!accessToken || !email) {
                message.error('Thiếu thông tin xác thực từ nhà cung cấp');
                popup.close();
                return;
            }

            localStorage.setItem('access_token', accessToken);
            const res = await authApi.callFetchUser(email);
            dispatch(setUserLoginInfo(res.data));

            popup.close();
            onClose();
            navigate('/sales', { replace: true });
            message.success('Đăng nhập thành công!');
        } catch (error) {
            console.error('Lỗi xử lý thông tin:', error);
            message.error('Lỗi xử lý thông tin đăng nhập');
            popup.close();
        }
    };


    const resetForms = () => {
        setActiveForm(null);
    };

    const handleBackClick = () => {
        resetForms();
        if (activeForm !== 'forgot') setIsLogin(true);
    };

    const handleFormToggle = (formType: 'login' | 'register') => {
        setIsLogin(formType === 'login');
        setActiveForm(formType);
    };

    const renderAuthButtons = () => {
        const buttonStyle = {
            fontSize: 14,
            borderRadius: 20,
            marginBottom: 10,
            border: "1px solid #ddd",
            position: "relative" as const,
        };

        const iconStyle = {
            position: "absolute" as const,
            left: 12,
            width: 20,
            height: 20
        };

        const authMethods = [
            {
                icon: "email",
                text: isLogin ? "Đăng nhập tài khoản email" : "Đăng ký tài khoản email",
                onClick: () => handleFormToggle(isLogin ? 'login' : 'register')
            },
            {
                icon: "google",
                text: isLogin ? "Đăng nhập với Google" : "Đăng ký với Google",
                onClick: () => handleOAuthLogin('google')
            },
            {
                icon: "facebook",
                text: isLogin ? "Đăng nhập với Facebook" : "Đăng ký với Facebook",
                onClick: () => handleOAuthLogin('facebook')
            },
            {
                icon: "zalo",
                text: isLogin ? "Đăng nhập với zalo" : "Đăng ký với zalo",
                onClick: () => handleOAuthLogin('zalo')
            },
        ];

        return authMethods.map((method, index) => (
            <Button
                key={index}
                block
                size="large"
                style={buttonStyle}
                onClick={method.onClick}
            >
                <img
                    style={iconStyle}
                    src={getIconSrc(method.icon)}
                    alt={`Logo ${method.icon}`}
                    width={20}
                    height={20}
                />
                {method.text}
            </Button>
        ));
    };

    const getIconSrc = (iconType: string) => {
        const icons = {
            email: "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10%2011c-2.67%200-8%201.34-8%204v3h16v-3c0-2.66-5.33-4-8-4m0-9C7.79%202%206%203.79%206%206s1.79%204%204%204%204-1.79%204-4-1.79-4-4-4m0%2010.9c2.97%200%206.1%201.46%206.1%202.1v1.1H3.9V15c0-.64%203.13-2.1%206.1-2.1m0-9a2.1%202.1%200%20110%204.2%202.1%202.1%200%20010-4.2'%20fill-opacity='.54'%20fill-rule='evenodd'%3e%3c/path%3e%3c/svg%3e",
            zalo: "https://img.icons8.com/color/48/zalo.png",
            google: "data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20transform=''%3e%3cg%20fill-rule='evenodd'%3e%3cpath%20d='m17.64%209.2a10.341%2010.341%200%200%200%20-.164-1.841h-8.476v3.481h4.844a4.14%204.14%200%200%201%20-1.8%202.716v2.264h2.909a8.777%208.777%200%200%200%202.687-6.62z'%20fill='%234285f4'/%3e%3cpath%20d='m9%2018a8.592%208.592%200%200%200%205.956-2.18l-2.909-2.258a5.43%205.43%200%200%201%20-8.083-2.852h-3.007v2.332a9%209%200%200%200%208.043%204.958z'%20fill='%2334a853'/%3e%3cpath%20d='m3.964%2010.71a5.321%205.321%200%200%201%200-3.42v-2.332h-3.007a9.011%209.011%200%200%200%200%208.084z'%20fill='%23fbbc05'/%3e%3cpath%20d='m9%203.58a4.862%204.862%200%200%201%203.44%201.346l2.581-2.581a8.649%208.649%200%200%200%20-6.021-2.345%209%209%200%200%200%20-8.043%204.958l3.007%202.332a5.364%205.364%200%200%201%205.036-3.71z'%20fill='%23ea4335'/%3e%3c/g%3e%3cpath%20d='m0%200h18v18h-18z'%20fill='none'/%3e%3c/g%3e%3c/svg%3e",
            facebook: "data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='m17.007%200h-16.014a.993.993%200%200%200%20-.993.993v16.014a.993.993%200%200%200%20.993.993h8.628v-6.961h-2.343v-2.725h2.343v-2a3.274%203.274%200%200%201%203.494-3.591%2019.925%2019.925%200%200%201%202.092.106v2.43h-1.428c-1.13%200-1.35.534-1.35%201.322v1.73h2.7l-.351%202.725h-2.364v6.964h4.593a.993.993%200%200%200%20.993-.993v-16.014a.993.993%200%200%200%20-.993-.993z'%20fill='%234267b2'%20/%3e%3cpath%20d='m28.586%2024.041v-6.961h2.349l.351-2.725h-2.7v-1.734c0-.788.22-1.322%201.35-1.322h1.443v-2.434a19.924%2019.924%200%200%200%20-2.095-.106%203.27%203.27%200%200%200%20-3.491%203.591v2h-2.343v2.73h2.343v6.961z'%20fill='%23fff'%20transform='translate(-16.172%20-6.041)'%20/%3e%3c/svg%3e"
        };

        return icons[iconType as keyof typeof icons] || '';
    };

    const modalBodyStyle = {
        maxHeight: "470px",
        borderRadius: "12px",
        padding: "30px 60px 20px",
        overflowY: "auto" as const,
        textAlign: "center" as const,
        scrollbarWidth: "none" as const,
        background: "fff"
    };

    return (
        <Modal
            centered
            open={open}
            width={480}
            footer={null}
            onCancel={() => {
                resetForms();
                onClose();
            }}
            bodyStyle={modalBodyStyle}
            title={activeForm && (
                <Button
                    type="text"
                    onClick={handleBackClick}
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
                    {activeForm === 'forgot'
                        ? "Quên mật khẩu"
                        : isLogin
                            ? "Đăng nhập tài khoản"
                            : "Đăng ký tài khoản"}
                </Title>
            </div>

            {/* Show button */}
            {!activeForm && renderAuthButtons()}

            {/* Show form */}
            {activeForm === 'login' && <LoginModal />}
            {activeForm === 'register' && <RegisterModal />}
            {activeForm === 'forgot' && <ForgotPasswordModal />}

            <div style={{ textAlign: "center", margin: '20px 0 10px' }}>
                {isLogin ? (
                    <>
                        <Text>Bạn chưa có tài khoản? </Text>
                        <span
                            style={{ color: "#ff4d4f", cursor: "pointer", textDecoration: 'underline' }}
                            onClick={() => {
                                setIsLogin(false);
                                resetForms();
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
                                resetForms();
                            }}
                        >
                            Đăng nhập
                        </span>
                    </>
                )}
            </div>

            {isLogin && !activeForm && (
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                    <span
                        onClick={() => setActiveForm('forgot')}
                        style={{ color: "#ff4d4f", textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Quên mật khẩu?
                    </span>
                </div>
            )}
        </Modal>
    );
};

export default AuthModal;