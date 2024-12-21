import '../../styles/client.home.scss'
import { Breadcrumb, Button, Flex, Layout, Menu, theme } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Layout>
                <header className="fixed-header">
                    <nav className="nav" style={{ padding: '4px 48px' }}>
                        <a href="#" className="nav__logo">
                            <div
                                style={{ color: '#ff403d', fontSize: '16px', fontWeight: 600 }}
                            >
                                .LOGO
                            </div>
                            {/* <img src=".." alt="LOGO" className="logo-img" /> */}
                        </a>

                        <ul className="nav__list" id="pc__nav">
                            <li className="nav__item">
                                <a href="#" className="nav__link">Sản phẩm</a>
                            </li>

                            <li className="nav__item">
                                <a href="#about" className="nav__link">Giải pháp</a>
                            </li>
                        </ul>

                        <Flex wrap gap="small">
                            <Button
                                type="text" danger
                                className="nav__btn"
                                style={{ width: '90px' }}
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập
                            </Button>

                            <Button
                                type="primary" danger
                                className="nav__btn"
                                onClick={() => navigate('/register')}
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
                                <img src="./assets/icon/meomeo.png" alt=""
                                    className="hero__img" />

                                <img src="./assets/icon/icon-right.svg" alt="" className="hero__decor hero__decor--right" />
                                <img src="./assets/icon/icon-left.svg" alt="" className="hero__decor hero__decor--left" />
                            </figure>

                            <figure className="hero__image hero__img--fit">
                                <img src="./assets/icon/concho.png" alt=""
                                    className="hero__img" />
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

                            <div className="hero__block__btn">
                                <Button
                                    type="primary"
                                    danger
                                    className="hero__btn"
                                    onClick={() => navigate('/register')}
                                    style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                                    Đăng ký ngay
                                </Button>

                                <a href="/login" className="hero-btn__link">Đăng nhập</a>
                            </div>
                        </section>
                    </section>
                </section>

                <Footer style={{ textAlign: 'center' }}>
                    Management restaurant ©{new Date().getFullYear()} Created by NKL
                </Footer>
            </Layout>
        </>
    )
}

export default HomePage;