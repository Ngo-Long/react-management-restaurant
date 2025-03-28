import {
    Col,
    Row,
    Card,
    Statistic,
    DatePicker,
    Space,
    Select
} from "antd";
import CountUp from 'react-countup';
import { useAppSelector } from "@/redux/hooks";
import { Line, Pie, Column } from '@ant-design/charts';
import { useState } from 'react';
const { RangePicker } = DatePicker;

const DashboardPage = () => {
    const metaOrder = useAppSelector(state => state.order.meta);
    const metaTable = useAppSelector(state => state.diningTable.meta);
    const metaProduct = useAppSelector(state => state.product.meta);
    const metaUser = useAppSelector(state => state.user.meta);
    const [timeRange, setTimeRange] = useState('week');

    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    // Dữ liệu mẫu cho biểu đồ
    const salesData = [
        { date: '2024-01', value: 35000000 },
        { date: '2024-02', value: 42000000 },
        { date: '2024-03', value: 57400000 },
        { date: '2024-04', value: 65000000 },
        { date: '2024-05', value: 72000000 },
        { date: '2024-06', value: 68000000 },
    ];

    const categoryData = [
        { type: 'Món chính', value: 35 },
        { type: 'Món phụ', value: 25 },
        { type: 'Đồ uống', value: 20 },
        { type: 'Tráng miệng', value: 15 },
        { type: 'Khác', value: 5 },
    ];

    const orderStatusData = [
        { type: 'Hoàn thành', value: 45 },
        { type: 'Đang xử lý', value: 30 },
        { type: 'Đã hủy', value: 15 },
        { type: 'Chờ xác nhận', value: 10 },
    ];

    const config = {
        data: salesData,
        xField: 'date',
        yField: 'value',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
    };

    const pieConfig = {
        data: categoryData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}%',
        },
    };

    const columnConfig = {
        data: orderStatusData,
        xField: 'type',
        yField: 'value',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
            },
        },
    };

    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Card>
                        <Space>
                            <Select
                                defaultValue="week"
                                style={{ width: 120 }}
                                onChange={setTimeRange}
                                options={[
                                    { value: 'week', label: 'Theo tuần' },
                                    { value: 'month', label: 'Theo tháng' },
                                    { value: 'year', label: 'Theo năm' },
                                ]}
                            />
                            <RangePicker />
                        </Space>
                    </Card>
                </Col>

                <Col span={24} md={6}>
                    <Card title="Doanh thu" bordered={false}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={53945000}
                            formatter={formatter}
                        />
                    </Card>
                </Col>

                <Col span={24} md={6}>
                    <Card title="Chi phí" bordered={false}>
                        <Statistic
                            title="Tổng chi phí"
                            value={24900000}
                            formatter={formatter}
                        />
                    </Card>
                </Col>

                <Col span={24} md={6}>
                    <Card title="Lợi nhuận" bordered={false}>
                        <Statistic
                            title="Tổng lợi nhuận"
                            value={29045000}
                            formatter={formatter}
                        />
                    </Card>
                </Col>

                <Col span={24} md={6}>
                    <Card title="Đơn hàng" bordered={false}>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={metaOrder.total}
                            formatter={formatter}
                        />
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Doanh thu theo thời gian">
                        <Line {...config} />
                    </Card>
                </Col>

                <Col span={24} md={12}>
                    <Card title="Doanh thu theo danh mục">
                        <Pie {...pieConfig} />
                    </Card>
                </Col>

                <Col span={24} md={12}>
                    <Card title="Trạng thái đơn hàng">
                        <Column {...columnConfig} />
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default DashboardPage;