import { useState } from "react";
import AuthModal from "@/pages/auth";
import '../../../styles/client.home.scss';
import { Button, Flex, Layout } from "antd";
import { Footer } from "antd/es/layout/layout";

const HomePage = () => {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <Layout>
                <header className="fixed-header">
                    <nav className="nav" style={{ padding: '4px 48px' }}>
                        <a href="#" className="nav__logo">
                            <div style={{ color: '#ff403d', fontSize: '16px', fontWeight: 600 }}>
                                Rservice
                            </div>
                        </a>

                        <ul className="nav__list" id="pc__nav">
                            <li className="nav__item"><a href="#" className="nav__link">Sản phẩm</a></li>
                            <li className="nav__item"><a href="#about" className="nav__link">Giải pháp</a></li>
                        </ul>

                        <Flex wrap gap="small">
                            <Button
                                danger
                                type="text"
                                className="nav__btn"
                                style={{ width: '90px' }}
                                onClick={() => {
                                    setIsLogin(true);
                                    setIsAuthOpen(true);
                                }}
                            >
                                Đăng nhập
                            </Button>

                            <Button
                                danger
                                type="primary"
                                className="nav__btn"
                                onClick={() => {
                                    setIsLogin(false);
                                    setIsAuthOpen(true);
                                }}
                            >
                                Đăng ký
                            </Button>
                        </Flex>
                    </nav>
                </header>

                <section className="hero">
                    <section className="hero__body">
                        <div className="hero-wrap__img">
                            <figure className="hero__image">
                                <img src="./assets/icon/meomeo.png" alt="" className="hero__img" />
                                <img src="./assets/icon/icon-right.svg" alt="" className="hero__decor hero__decor--right" />
                                <img src="./assets/icon/icon-left.svg" alt="" className="hero__decor hero__decor--left" />
                            </figure>

                            <figure className="hero__image hero__img--fit">
                                <img src="./assets/icon/concho.png" alt="" className="hero__img" />
                            </figure>

                            <div className="hero-wrap__text">
                                <div className="hero__info">
                                    <img src="./assets/img/cho-nho-1.png" alt="" className="hero__img--small" />
                                    <div className="hero__group">
                                        <p className="hero__name">Chế độ</p>
                                        <div className="hero__span">
                                            <span className="hero__span--long"></span>
                                            <span className="hero__span--short"></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hero__hr"></div>

                                <div className="hero__info">
                                    <img src="./assets/img/cho-nho-2.png" alt="" className="hero__img--small" />
                                    <div className="hero__group">
                                        <p className="hero__name">Thống kê</p>
                                        <div className="hero__span">
                                            <span className="hero__span--long"></span>
                                            <span className="hero__span--short"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="hero-block__text">
                            <h1 className="hero__heading">
                                Quản lý nhà hàng miễn phí
                            </h1>

                            <p className="hero__desc">
                                Quản lý nhà hàng miễn phí với nhiều tính năng tiện lợi,
                                hỗ trợ tối ưu hóa mọi hoạt động kinh doanh các nhà hàng nhỏ đến lớn.
                            </p>

                            <div className="hero__block__btn" style={{ display: 'flex', gap: '10px' }}>
                                <Button
                                    danger
                                    type="primary"
                                    className="hero__btn"
                                    onClick={() => {
                                        setIsLogin(false);
                                        setIsAuthOpen(true);
                                    }}
                                    style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                                    Đăng ký ngay
                                </Button>

                                <Button
                                    type="link"
                                    className="hero-btn__link"
                                    onClick={() => {
                                        setIsLogin(true);
                                        setIsAuthOpen(true);
                                    }}>
                                    Đăng nhập
                                </Button>
                            </div>
                        </section>
                    </section>
                </section>

                <Footer style={{ textAlign: 'center' }}>
                    Rservice ©{new Date().getFullYear()} Created by NKL
                </Footer>
            </Layout >

            {/* Auth Modal */}
            < AuthModal
                open={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
            />
        </>
    );
}

export default HomePage;
