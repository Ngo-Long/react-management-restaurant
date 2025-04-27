import {
    Flex,
    Modal,
    Table,
    Space,
    Radio,
    Button,
    Select,
    message,
} from 'antd';
import { ColumnType } from 'antd/es/table';

import { useState } from 'react';
import { orderApi } from '@/config/api';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/format';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { IDiningTable, IOrder, IOrderDetail } from '@/types/backend';
import { fetchDiningTableByRestaurant } from '@/redux/slice/diningTableSlide';

declare type IProps = {
    isModalMerge: boolean;
    setIsModalMerge: (v: boolean) => void;
    currentOrder: IOrder | null;
    sortedOrderDetails: any;
}

const ModalMergeOrder = ({
    isModalMerge,
    setIsModalMerge,
    currentOrder,
    sortedOrderDetails
}: IProps) => {
    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.orderDetail.meta);

    const [loading, setLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState<number>(1);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [selectedItemsToSplit, setSelectedItemsToSplit] = useState<string[]>([]);
    const diningTables = useSelector((state: RootState) => state.diningTable.result);

    // Tạo options cho select tách bàn
    const splitTableOptions = currentOrder?.diningTables?.map(table => ({
        value: table.id,
        label: table.name
    })) || [];

    // Tạo options cho select món ăn cần tách
    const itemOptions = sortedOrderDetails?.map((item: IOrderDetail) => ({
        value: item.id,
        label: `${item.product?.name} (${item.quantity}x)`
    })) || [];

    const handleSplitTable = async () => {
        if (!currentOrder || selectedItemsToSplit.length === 0 || !selectedTables[0]) {
            message.info('Vui lòng chọn bàn và món ăn cần tách');
            return;
        }

        try {
            setLoading(true);
            const [tableId] = selectedTables[0].split(' - ');

            // Gọi API tách bàn
            // await orderApi.callSplitTable({
            //     originalOrderId: currentOrder.id,
            //     newTableId: tableId,
            //     orderDetailIds: selectedItemsToSplit
            // });

            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100&sort=sequence,asc&filter=active=true' }));
            message.success('Tách bàn thành công');
            setIsModalMerge(false);
            setSelectedTables([]);
            setSelectedItemsToSplit([]);
        } catch (error) {
            message.error('Tách bàn thất bại');
        } finally {
            setLoading(false);
        }
    };

    const tableOptions = diningTables.map((table: IDiningTable) => {
        const firstOrder = table.orders?.[0];
        return {
            value: `${table.id} - ${table.name}`,
            label: firstOrder ? `${firstOrder.id} - ${table.name}` : `${table.name}`,
            disabled: table.orders && table.orders.length > 0
        }
    });

    const handleMergeTables = async () => {
        if (!currentOrder || selectedTables.length === 0) {
            message.info('Vui lòng chọn bàn');
            return;
        };

        const invalidTables = [];
        for (const option of selectedTables) {
            const [id] = option.split(' - ');
            const table = diningTables.find((t: IDiningTable) => t.id?.toString() === id);
            if (table?.orders && table.orders.length > 0) {
                invalidTables.push(table.name || id);
            }
        }

        if (invalidTables.length > 0) {
            message.error(`Không thể ghép các bàn đã có đơn hàng: ${invalidTables.join(', ')}`);
            return;
        }

        try {
            setLoading(true);
            const tableIds = selectedTables.map(option => {
                const [id] = option.split(' - ');
                return id;
            });

            const updatedOrder: IOrder = {
                ...currentOrder,
                diningTables: [
                    ...(currentOrder.diningTables || []),
                    ...tableIds.map(id => ({ id }))
                ]
            };

            await orderApi.callMergeTable(updatedOrder);
            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100&sort=sequence,asc&filter=active=true' }));
            message.success('Ghép bàn thành công');
            setIsModalMerge(false);
            setSelectedTables([]);
        } catch (error) {
            message.error('Ghép bàn thất bại');
        } finally {
            setLoading(false);
        }
    };

    const mergeColumns: ColumnType<IOrder>[] = [
        {
            title: 'Khách hàng',
            width: 160,
            render: (_, record) => (
                <Space>
                    {(`${record.client?.name} (${record.client?.phoneNumber})`) || 'Khách vãng lai'}
                </Space>
            )
        },
        {
            width: 50,
            title: 'Mã đơn',
            dataIndex: 'id',
            align: "center",
        },
        {
            title: 'SL hàng',
            align: 'center',
            width: 60,
            render: () => (meta.total)
        },
        {
            title: 'T.Tiền',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Space>
                    {formatPrice(record.totalPrice)}
                </Space>
            ),
        }
    ];

    const splitColumns: ColumnType<IOrderDetail>[] = [
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
                title={`${`Đơn hàng ${currentOrder?.id} -
                            ${[...(currentOrder?.diningTables || [])]
                        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                        .map(table => table.name)
                        .join(', ')}`
                    }`}
                width={550}
                open={isModalMerge}
                className='container-modal'
                onCancel={() => setIsModalMerge(false)}
                footer={[
                    <Button onClick={() => setIsModalMerge(false)}>
                        Đóng
                    </Button>,
                    <Button
                        loading={loading}
                        className="btn-green"
                        onClick={selectedAction === 1 ? handleMergeTables : handleSplitTable}
                    >
                        Xác nhận
                    </Button>
                ]}
            >
                <div className='modal-content'>
                    <Radio.Group
                        name="radiogroup"
                        value={selectedAction}
                        onChange={(e) => {
                            setSelectedAction(e.target.value);
                            setSelectedTables([]);
                            setSelectedItemsToSplit([]);
                        }}
                        options={[
                            { value: 1, label: 'Ghép bàn' },
                            { value: 2, label: 'Tách bàn' },
                        ]}
                    />

                    {selectedAction === 1 ? (
                        // Giao diện ghép bàn
                        <>
                            <Flex align='center' gap={10} style={{ marginTop: '20px' }}>
                                Chọn bàn ghép:
                                <Select
                                    mode="multiple"
                                    style={{ minWidth: 160, maxWidth: 370 }}
                                    onChange={setSelectedTables}
                                    options={tableOptions}
                                    placeholder={'Chọn phòng/bàn'}
                                    value={selectedTables}
                                />
                            </Flex>

                            <Table<IOrder>
                                size='small'
                                columns={mergeColumns}
                                pagination={false}
                                style={{ marginTop: 20 }}
                                dataSource={currentOrder ? [currentOrder] : []}
                                className="order-table"
                                rowClassName="order-table-row"
                                rowKey={(record) => record.id || ''}
                                scroll={{ y: '30vh' }}
                            />
                        </>
                    ) : (
                        // Giao diện tách bàn
                        <>
                            <Flex align='center' gap={10} style={{ marginTop: '20px' }}>
                                Chọn bàn tách:
                                <Select
                                    mode="multiple"
                                    style={{ minWidth: 160, maxWidth: 370 }}
                                    onChange={setSelectedTables}
                                    options={tableOptions}
                                    placeholder={'Chọn phòng/bàn'}
                                    value={selectedTables}
                                />
                            </Flex>

                            <Table<IOrderDetail>
                                size='small'
                                columns={splitColumns}
                                pagination={false}
                                style={{ marginTop: 20 }}
                                dataSource={sortedOrderDetails}
                                className="order-table"
                                rowClassName="order-table-row"
                                rowKey={(record) => record.id || ''}
                                scroll={{ y: '30vh' }}
                            />
                        </>
                    )}
                </div>
            </Modal>
        </>
    )
}

export default ModalMergeOrder;