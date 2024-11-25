import { Card, Col, Row, Statistic } from "antd";
import CountUp from 'react-countup';

const DashboardPage = () => {
    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={6}>
                <Card title="Doanh thu" bordered={false} >
                    <Statistic
                        title="Tổng doanh thu hôm nay"
                        value={5394500}
                        formatter={formatter}
                    />

                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Đơn hàng" bordered={false} >
                    <Statistic
                        title="Tổng đơn hàng hôm nay"
                        value={95}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Khách hàng" bordered={false} >
                    <Statistic
                        title="Tổng khách hàng hôm nay"
                        value={201}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Bàn ăn" bordered={false} >
                    <Statistic
                        title="Đang hoạt động"
                        value={20}
                        formatter={formatter}
                    />
                </Card>
            </Col>
        </Row>
    )
}

export default DashboardPage;