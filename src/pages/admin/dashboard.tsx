import {
    Col,
    Row,
    Card,
    Statistic,
    DatePicker,
    Space,
    Select
} from "antd";
const { RangePicker } = DatePicker;
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';
import { Line, Pie, Column } from '@ant-design/charts';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";
import { fetchOrderByRestaurant } from "@/redux/slice/orderSlide";
import { fetchProductsByRestaurant } from "@/redux/slice/productSlide";
import { fetchUserByRestaurant } from "@/redux/slice/userSlide";
import { fetchClientsByRestaurant } from "@/redux/slice/clientSlide";
import { fetchTotalRevenue } from "@/redux/slice/invoiceSlide";
import { fetchTotalCost } from "@/redux/slice/orderDetailSlide";

const DashboardPage = () => {
    const dispatch = useAppDispatch();
    const [timeRange, setTimeRange] = useState('week');
    const metaUser = useAppSelector(state => state.user.meta);
    const metaOrder = useAppSelector(state => state.order.meta);
    const metaClient = useAppSelector(state => state.client.meta);
    const metaProduct = useAppSelector(state => state.product.meta);
    const metaTable = useAppSelector(state => state.diningTable.meta);
    const totalCost = useAppSelector(state => state.orderDetail.totalCost);
    const totalRevenue = useAppSelector(state => state.invoice.totalRevenue);

    useEffect(() => {
        dispatch(fetchTotalCost());
        dispatch(fetchTotalRevenue());
        dispatch(fetchUserByRestaurant({ query: '' }))
        dispatch(fetchOrderByRestaurant({ query: '' }))
        dispatch(fetchClientsByRestaurant({ query: '' }))
        dispatch(fetchProductsByRestaurant({ query: '' }))
        dispatch(fetchDiningTableByRestaurant({ query: '' }));
    }, [dispatch]);

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
        <Row gutter={[20, 20]}>
            {/* <Col span={24}>
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
            </Col> */}

            <Col span={24} md={6}>
                <Card title="Doanh thu" bordered={false}>
                    <Statistic
                        title="Tổng doanh thu"
                        value={totalRevenue}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Chi phí" bordered={false}>
                    <Statistic
                        title="Tổng chi phí"
                        value={totalCost}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Lợi nhuận" bordered={false}>
                    <Statistic
                        title="Tổng lợi nhuận"
                        value={totalRevenue - totalCost}
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

            <Col span={24} md={6}>
                <Card title="Bàn ăn" bordered={false}>
                    <Statistic
                        title="Tổng bàn ăn"
                        value={metaTable.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Người dùng" bordered={false}>
                    <Statistic
                        title="Tổng người dùng"
                        value={metaUser.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Khách hàng" bordered={false}>
                    <Statistic
                        title="Tổng khách hàng"
                        value={metaClient.total}
                        formatter={formatter}
                    />
                </Card>
            </Col>

            <Col span={24} md={6}>
                <Card title="Sản phẩm" bordered={false}>
                    <Statistic
                        title="Tổng đơn hàng"
                        value={metaProduct.total}
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
    )
}

export default DashboardPage;