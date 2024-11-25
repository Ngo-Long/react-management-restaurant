import {
    Button, Divider, Form,
    Input, message, notification
} from 'antd';
import styles from 'styles/auth.module.scss';

import { authApi } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';

import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from '@/components/share/loading';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isSubmit, setIsSubmit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        //đã login => redirect to '/'
        if (isAuthenticated) {
            // navigate('/');
            window.location.href = '/';
        }
    }, [])

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
                    navigate(callback || "/", { replace: true });
                } else {
                    notification.error({
                        message: "Có lỗi xảy ra",
                        description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                        duration: 5,
                    });
                }
            } catch (error) {
                setIsSubmit(false);
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: "Vui lòng kiểm tra lại thông tin đăng nhập của bạn.",
                    duration: 5,
                });
            }
        }, 2000);
    };

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <div className={styles["login-page"]}>
                    <main className={styles.main}>
                        <div className={styles.container}>
                            <section className={styles.wrapper}>
                                <div className={styles.heading}>
                                    <h2 className={`${styles.text} ${styles["text-large"]}`}>Đăng Nhập</h2>
                                    <Divider />
                                </div>

                                <Form
                                    name="basic"
                                    // style={{ maxWidth: 600, margin: '0 auto' }}
                                    onFinish={onFinish}
                                    autoComplete="off"
                                >
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Email"
                                        name="username"
                                        rules={[{ required: true, message: 'Email không được để trống!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                    // wrapperCol={{ offset: 6, span: 16 }}
                                    >
                                        <Button type="primary" htmlType="submit" loading={isSubmit}>
                                            Đăng nhập
                                        </Button>
                                    </Form.Item>
                                    <Divider>Or</Divider>
                                    <p className="text text-normal">Chưa có tài khoản ?
                                        <span>
                                            <Link to='/register' > Đăng Ký </Link>
                                        </span>
                                    </p>
                                </Form>
                            </section>
                        </div>
                    </main>
                </div>
            )}
        </>
    )
}

export default LoginPage;