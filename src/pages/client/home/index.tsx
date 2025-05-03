import { useState } from "react";
import AuthModal from "@/pages/auth";
import '../../../styles/client.home.scss';
import { Button, Flex, Layout, Typography, Card, Row, Col } from "antd";
import { Footer } from "antd/es/layout/layout";
import { ArrowUpOutlined } from '@ant-design/icons';

const HomePage = () => {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const primaryColor = '#ff4d4f';
    const secondaryColor = '#40a9ff';
    const textColor = '#333333';
    const lightTextColor = '#fff';
    const backgroundColor = '#fff'; // Nền ngoài cùng màu trắng
    const cardBackgroundColor = '#555';
    const sectionBackgroundColor = '#e6f7ff';

    const cardStyle = {
        borderRadius: '12px',
        backgroundColor: sectionBackgroundColor,
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };

    const sectionStyle = {
        padding: '20px',
        backgroundColor: backgroundColor, // Nền ngoài cùng màu trắng
    };

    return (
        <>
            <Layout style={{ backgroundColor: backgroundColor }}>
                <header className="fixed-header">
                    <nav className="nav" style={{ padding: '4px 48px' }}>
                        <a href="#" className="nav__logo">
                            <div style={{ color: primaryColor, fontSize: '30px', fontWeight: 600 }}>
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
                                    style={{ color: lightTextColor, fontSize: '16px', fontWeight: 600 }}>
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

                <section style={{ padding: '20px', textAlign: 'center' }}>
                    <Typography.Title level={3} style={{ color: textColor }}>Quản lý nhà hàng hiệu quả</Typography.Title>
                    <Typography.Text style={{ fontSize: '16px', color: secondaryColor }}>
                        <ArrowUpOutlined /> 10.000+ Nhà kinh doanh mới mỗi tháng
                    </Typography.Text>
                </section>

             <section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={{ ...cardStyle, backgroundColor: '#fff3e0' }}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            <Col xs={24} md={8}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2023/10/06034247/Ban-hang-Online-1.png"
                        alt="Quản lý quy trình"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>

            <Col xs={24} md={12}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Quản lý quy trình Phục vụ - Thu ngân - Bếp chuẩn xác, thuận lợi
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Theo dõi hoạt động, thao tác thông báo giữa các bên phục vụ, thu ngân, quầy bar/bếp thuận tiện và kịp thời.
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>Tối ưu hóa quá trình xử lý đơn hàng</li>
                        <li>Giảm thiểu sai sót và tăng tốc độ phục vụ</li>
                        <li>Cải thiện giao tiếp giữa các bộ phận</li>
                    </ul>
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Tìm hiểu thêm
                </Button>
            </Col>
        </Row>
    </Card>
</section>



<section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={cardStyle}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            <Col xs={24} md={8}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2023/10/06034315/Image-5.png"
                        alt="Tiết kiệm thời gian"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>
            <Col xs={24} md={12}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Tiết kiệm tối đa thời gian phục vụ
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Phục vụ khách với món thông qua Mobile, Tablet chuyên nghiệp, dễ dàng thêm/bớt topping,... đáp ứng mọi nhu cầu cao điểm.
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>Giảm thời gian chờ đợi của khách</li>
                        <li>Tăng hiệu suất phục vụ</li>
                        <li>Nâng cao trải nghiệm khách hàng</li>
                    </ul>
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Xem chi tiết
                </Button>
            </Col>
        </Row>
    </Card>
</section>



              <section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={{ ...cardStyle, backgroundColor: '#fff8e1' }}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            <Col xs={24} md={8}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2023/10/06034238/Image-1-1.png"
                        alt="Thanh toán nhanh"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>
            <Col xs={24} md={12}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Thanh toán nhanh, giảm thiểu thất thoát
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Hỗ trợ thu ngân thanh toán nhanh trong giờ cao điểm, giảm thiểu nhầm lẫn.
                    Tất cả thao tác của nhân viên đều được lưu trữ rõ ràng, dễ dàng tra cứu khi cần thiết.
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Xem chi tiết
                </Button>
            </Col>
        </Row>
    </Card>
</section>



               <section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={{ ...cardStyle, backgroundColor: '#e8f5e9' }}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            {/* Đảo ngược vị trí ảnh và nội dung bằng cách thay đổi thứ tự Col */}
            <Col xs={24} md={8} style={{ order: 2 }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2023/10/06034256/Image-2-1.png"
                        alt="Điều phối chế biến"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>
            <Col xs={24} md={12} style={{ order: 1 }}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Hỗ trợ quầy Bar/bếp điều phối chế biến
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Tích hợp máy in bếp thông báo gọi món. Màn hình bếp hiển thị trực tiếp tất cả món ăn được yêu cầu chế biến từ bồi bàn hoặc khách hàng.
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Xem chi tiết
                </Button>
            </Col>
        </Row>
    </Card>
</section>



              <section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={{ ...cardStyle, backgroundColor: '#e3f2fd' }}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            <Col xs={24} md={8}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2019/07/3-gai-qu%C3%A1n-2.jpg"
                        alt="Đặt bàn dễ dàng"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>
            <Col xs={24} md={12}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Đặt bàn, đặt chỗ từ xa một cách dễ dàng
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Phần mềm hỗ trợ quản lý phòng bàn chuyên nghiệp, kiểm tra nhanh bàn nào còn trống,
                    bàn nào đã có khách... hoặc đặt bàn sẵn theo nhu cầu của khách.
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Xem chi tiết
                </Button>
            </Col>
        </Row>
    </Card>
</section>



              <section style={{ ...sectionStyle, maxWidth: '1000px', margin: '40px auto' }}>
    <Card style={{ ...cardStyle, backgroundColor: '#e3f2fd' }}>
        <Row gutter={[24, 24]} align="middle" justify="start">
            <Col xs={24} md={8}>
                <div style={{ position: 'relative' }}>
                    <img
                        src="https://cdn-kvweb.kiotviet.vn/kiotviet-website/wp-content/uploads/2020/08/B%C3%A1-Minh-Silk.png"
                        alt="Đặt bàn dễ dàng"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>
            </Col>
            <Col xs={24} md={12}>
                <Typography.Title level={4} style={{ color: textColor }}>
                    Đặt bàn, đặt chỗ từ xa một cách dễ dàng
                </Typography.Title>
                <Typography.Paragraph style={{ color: textColor, lineHeight: '1.6' }}>
                    Phần mềm hỗ trợ quản lý phòng bàn chuyên nghiệp, kiểm tra nhanh bàn nào còn trống,
                    bàn nào đã có khách... hoặc đặt bàn sẵn theo nhu cầu của khách.
                </Typography.Paragraph>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: lightTextColor,
                        borderRadius: '20px',
                    }}
                >
                    Xem chi tiết
                </Button>
            </Col>
        </Row>
    </Card>
</section>



                
                <section style={{ padding: '20px', marginTop: '20px', backgroundColor: '#001529', color: '#fff' }}>
                    <Row gutter={[16, 16]} justify="space-around">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Rservice</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>Công ty Cổ phần Phần mềm Citigo</Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Hotline: 1800 6162 <br />
                                Email: hotro@rservice.com
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Trụ sở: Tầng 6, Toà nhà FPT Tower, số 10 Phạm Văn Bạch, Phường Dịch Vọng, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Doanh nghiệp</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Giới thiệu
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Điều khoản & chính sách sử dụng
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Quyền riêng tư
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Tuyển dụng Rservice
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Hỗ trợ</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Câu hỏi thường gặp
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Wiki Rservice
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Blog
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Thông tin cập nhật Covid
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>1800 6162</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                1800 65 22
                            </Typography.Paragraph>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} justify="space-around">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Ngành hàng</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Bán lẻ
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Siêu thị & tạp hóa
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Thiết bị điện tử & điện máy
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Vật liệu xây dựng
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Mẹ & Bé
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Thời trang & phụ kiện
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Sách & văn phòng phẩm
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Sản xuất
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Ẩm thực</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Mỳ cay
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Nhà hàng & quán ăn
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Cafe, Trà sữa
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Bún, Phở & đồ ăn sáng
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Cơm
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Lẩu, Nướng
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Dịch vụ</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Spa & Massage
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Nail & Mi
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Khách sạn & nhà nghỉ
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Karaoke
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Bida
                            </Typography.Paragraph>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} justify="space-around">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Địa chỉ miền Bắc</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Số 10, ngõ Quan Thổ 1, phố Tôn Đức Thắng, phường Hàng Bột, quận Đống Đa, Hà Nội <br />
                                Hotline: 02473050616
                            </Typography.Paragraph>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Địa chỉ miền Trung</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Số 386 Điện Biên Phủ, phường Thanh Khê Đông, quận Thanh Khê, Đà Nẵng <br />
                                Hotline: 02367305616
                            </Typography.Paragraph>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Typography.Title level={5} style={{ color: lightTextColor }}>Địa chỉ miền Nam</Typography.Title>
                            <Typography.Paragraph style={{ color: lightTextColor }}>
                                Tầng 6, toà nhà Lottery Tower, số 77 Trần Nhân Tôn, Phường 9, Quận 5, TP. Hồ Chí Minh <br />
                                Hotline: 02873050616
                            </Typography.Paragraph>
                        </Col>
                    </Row>
                </section>

                <Footer style={{ textAlign: 'center', backgroundColor: '#001529', color: lightTextColor }}>
                    Rservice ©{new Date().getFullYear()} Created by NKL
                </Footer>
            </Layout >

            <AuthModal
                open={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
            />
        </>
    );
}

export default HomePage;