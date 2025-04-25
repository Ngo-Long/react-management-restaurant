import {
    Row,
    Col,
    Card,
    Flex,
    Modal,
    Badge,
    Table,
    Space,
    Avatar,
    Button,
    message,
    InputNumber,
    notification,
    Tooltip,
    Radio,
    Select,
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    FormOutlined,
    CheckOutlined,
    MinusOutlined,
    AlertOutlined,
    CloseOutlined,
    DollarOutlined,
    HistoryOutlined,
    ScheduleOutlined,
    HourglassOutlined,
    SplitCellsOutlined,
    ShoppingCartOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import TextArea from 'antd/es/input/TextArea';

import InvoiceCard from '../invoice.card';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/format';
import React, { useEffect, useState } from 'react';
import { IDiningTable, IOrder, IOrderDetail } from '@/types/backend';
import { orderApi, orderDetailApi } from '@/config/api';
import DropdownMenu from '@/components/share/dropdown.menu';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchOrderByRestaurant } from '@/redux/slice/orderSlide';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';
import { fetchOrderDetailsByOrderId, resetOrderDetails } from '@/redux/slice/orderDetailSlide';

declare type IProps = {
    isModalMerge: boolean;
    setIsModalMerge: (v: boolean) => void;
    currentOrder: IOrder | null;
    sortedOrderDetails: any;
    // selectedOrder?: IOrder | null;
    // setSelectedOrder: (v: any) => void;
}

const ModalMergeOrder = ({
    isModalMerge,
    setIsModalMerge,
    currentOrder,
    sortedOrderDetails
    // selectedOrder,
    // setSelectedOrder,
}: IProps) => {
    const diningTables = useSelector((state: RootState) => state.diningTable.result);
    const tableOptions = diningTables.map((table: IDiningTable) => ({
        value: `${table.id} - ${table.name}`,
        label: table.name,
    }));


    const columns: ColumnType<IOrderDetail>[] = [
        {
            title: '#',
            width: 25,
            align: "center",
            render: (_, record, index) => (index + 1),
        },
        {
            title: 'Tên món ăn',
            key: 'name',
            dataIndex: 'unit',
            width: 160,
            render: (_, record) => (
                <div className='btn-name'>
                    {`${record.product?.name} (${record.unit?.name})`}
                    {record?.note && (
                        <>
                            <br />
                            {`⤷ ${record.note}`}
                        </>
                    )}
                </div>
            )
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 50
        },
        {
            title: 'T.Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 90,
            align: 'center',
            render: (_, record) => (
                <Space>
                    {formatPrice(record.quantity! * record.unit?.price!)}
                </Space>
            ),
        }
    ];

    return (
        <>
            <Modal
                title={`${`Đơn hàng ${currentOrder?.id} /
                            ${currentOrder?.diningTables!
                            .map(table => table.name)
                            .join(' - ')}`
                }`}
                width={550}
                open={isModalMerge}
                className='container-modal'
                onCancel={() => setIsModalMerge(false)}
                footer={[
                    <Button
                        onClick={() => setIsModalMerge(false)}
                    >
                        Hủy
                    </Button>,
                    <Button
                        className="btn-green"
                    >
                        Thực hiện
                    </Button>
                ]}
            >
                <div className='modal-content'>
                    <Radio.Group
                        name="radiogroup"
                        defaultValue={1}
                        options={[
                            { value: 1, label: 'Ghép đơn' },
                            { value: 2, label: 'Tách đơn' },
                        ]}
                    />

                    <Flex align='center' gap={10} style={{ marginTop: '20px' }}>
                        <div className='modal-card__title'>Ghép đến:</div>

                        <Select
                            mode="multiple"
                            style={{ minWidth: 150, maxWidth: 380 }}
                            // onChange={handleChange}
                            options={tableOptions}
                            placeholder={'Chọn phòng/bàn'}
                        />
                    </Flex>

                    <Table<IOrderDetail>
                        size='small'
                        columns={columns}
                        pagination={false}
                        style={{ marginTop: 20 }}
                        dataSource={sortedOrderDetails}
                        className="order-table"
                        rowClassName="order-table-row"
                        rowKey={(record) => record.id || ''}
                        scroll={{ y: '30vh' }}
                    />
                </div>
            </Modal>
        </>
    )
}

export default ModalMergeOrder;