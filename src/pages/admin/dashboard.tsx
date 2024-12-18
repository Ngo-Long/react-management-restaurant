import { useAppSelector } from "@/redux/hooks";
import { Card, Col, Row, Statistic } from "antd";
import CountUp from 'react-countup';

const DashboardPage = () => {
    const metaOrder = useAppSelector(state => state.order.meta);
    const metaTable = useAppSelector(state => state.diningTable.meta);
    const metaProduct = useAppSelector(state => state.product.meta);
    const metaUser = useAppSelector(state => state.user.meta);

    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={6}>
                <Card title="Doanh số" bordered={false} >
                    <Statistic
                        title="Tổng doanh số trong tháng"
                        value={57400000}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Doanh thu" bordered={false} >
                    <Statistic
                        title="Tổng doanh thu trong tháng"
                        value={53945000}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Chi phí" bordered={false} >
                    <Statistic
                        title="Tổng chi phí trong tháng"
                        value={24900000}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Lợi nhuận" bordered={false} >
                    <Statistic
                        title="Tổng lợi nhuận trong tháng"
                        value={29045000}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Đơn hàng" bordered={false} >
                    <Statistic
                        title="Tổng đơn hàng đang có"
                        value={metaOrder.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Nhân viên" bordered={false} >
                    <Statistic
                        title="Tổng nhân viên đang có"
                        value={metaUser.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Phòng bàn" bordered={false} >
                    <Statistic
                        title="Tổng phòng bàn đang có"
                        value={metaTable.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Hàng hóa" bordered={false} >
                    <Statistic
                        title="Tổng hàng hóa đang có"
                        value={metaProduct.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>
        </Row>
    )
}

export default DashboardPage;