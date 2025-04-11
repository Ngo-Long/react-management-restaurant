import {
    Row,
    Col,
    Card,
    Calendar,
    CalendarProps,
} from 'antd';
import {
    ScheduleOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import '@/styles/client.table.scss';
import queryString from 'query-string';
import CalendarModal from './calendar';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import TableCalendarModal from './tables';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useState } from 'react';
import DropdownMenu from '@/components/share/dropdown.menu';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';

import 'dayjs/locale/vi';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const ReceptionClient: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');
    const orders = useSelector((state: RootState) => state.order?.result);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['WAITING', 'RESERVED', 'PENDING']);

    useEffect(() => {
        fetchData();
    }, [dispatch, selectedStatuses]);

    const fetchData = () => {
        let statusFilter = "";
        if (selectedStatuses.length > 0) {
            statusFilter = selectedStatuses.map(status => `status~'${status}'`).join(' or ');
        }

        let query = "filter=option~'SCHEDULED'";
        if (statusFilter) query += ` and (${statusFilter})`;
        query += "&sort=reservationTime,asc";

        dispatch(fetchOrderByRestaurant({ query }));
    };

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    const handleStatusChange = (checkedValues: string[]) => {
        setSelectedStatuses(checkedValues);
    };

    const contentList: Record<string, React.ReactNode> = {
        tab1: (
            <CalendarModal
                dataOrders={orders}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        ),
        tab2: (
            <TableCalendarModal
                dataOrders={orders}
                fetchData={fetchData}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        )
    };

    return (
        <Row>
            <Col span={5}>
                <Card title="Lịch đặt bàn" style={{ height: '100%' }} size='small'>
                    <Calendar fullscreen={false} onPanelChange={onPanelChange} />
                </Card>
            </Col>

            <Col span={19}>
                <Card
                    tabList={[
                        { key: 'tab1', tab: 'Theo lịch', icon: <ScheduleOutlined /> },
                        { key: 'tab2', tab: 'Theo danh sách', icon: <FileTextOutlined /> }
                    ]}
                    bordered={true}
                    className={'no-select'}
                    style={{ minHeight: '100vh' }}
                    activeTabKey={activeTabKey}
                    tabBarExtraContent={<DropdownMenu />}
                    onTabChange={(key) => setActiveTabKey(key)}
                >
                    {contentList[activeTabKey]}
                </Card>
            </Col>
        </Row>
    );
};

export default ReceptionClient;
