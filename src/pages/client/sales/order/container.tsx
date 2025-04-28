import {
    Flex,
    Modal,
    Table,
    Space,
    Radio,
    Button,
    Select,
    message,
    InputNumber,
} from 'antd';
import {
    PlusOutlined,
    MinusOutlined,
} from '@ant-design/icons';
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
    sortedOrderDetails: IOrderDetail[];
}

const ModalMergeOrder = ({
    isModalMerge,
    setIsModalMerge,
    currentOrder,
    sortedOrderDetails
}: IProps) => {
    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.orderDetail.meta);
    const diningTables = useSelector((state: RootState) => state.diningTable.result);

    const [loading, setLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState<number>(1);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [selectedItemsToSplit, setSelectedItemsToSplit] = useState<string[]>([]);
    const [splitQuantities, setSplitQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (id: string, value: number | null) => {
        if (value !== null) {
            setSplitQuantities(prev => ({
                ...prev,
                [id]: value
            }));

            // Tự động chọn món nếu số lượng > 0
            if (value > 0 && !selectedItemsToSplit.includes(id)) {
                setSelectedItemsToSplit(prev => [...prev, id]);
            } else if (value <= 0 && selectedItemsToSplit.includes(id)) {
                setSelectedItemsToSplit(prev => prev.filter(itemId => itemId !== id));
            }
        }
    };

    const handleSplitTable = async () => {
        if (selectedItemsToSplit.length === 0 || !selectedTables[0]) {
            message.info('Vui lòng chọn bàn và món ăn cần tách');
            return;
        }

        // Validate số lượng tách
        for (const itemId of selectedItemsToSplit) {
            const originalItem = sortedOrderDetails.find((item: any) => item.id === itemId);
            const splitQty = splitQuantities[itemId] || 0;

            if (!originalItem || splitQty <= 0 || splitQty > originalItem.quantity!) {
                message.error(`Số lượng tách không hợp lệ cho món ${originalItem?.product?.name}`);
                return;
            }
        }

        try {
            setLoading(true);

            // Gọi API tách bàn
            await orderApi.callMergeOrder({
                orderId: currentOrder?.id,
                diningTables: selectedTables.map(table => ({
                    id: table.split(' - ')[0]
                })),
                orderDetails: selectedItemsToSplit.map(id => ({
                    id,
                    quantity: splitQuantities[id] || 1
                }))
            });

            dispatch(fetchDiningTableByRestaurant({ query: '?page=1&size=100&sort=sequence,asc&filter=active=true' }));
            message.success('Tách bàn thành công');
            setIsModalMerge(false);
            setSelectedTables([]);
            setSplitQuantities({});
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
                    {record.client ?
                        (`${record.client?.name} (${record.client?.phoneNumber})`) :
                        'Khách vãng lai'
                    }
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
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 81,
            render: (_, record) => {
                const maxQuantity = record.quantity || 1;
                const currentValue = splitQuantities[record.id!] || 0;

                return (
                    <Flex align="center" gap="small">
                        <Button
                            style={{ height: '22px', width: '22px' }}
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, Math.max(0, currentValue - 1))}
                        >
                            <MinusOutlined style={{ width: 10 }} />
                        </Button>

                        <InputNumber
                            key={`input-${record.id}`}
                            min={0}
                            max={record.quantity}
                            size="small"
                            controls={false}
                            style={{ width: '52px' }}
                            value={currentValue}
                            onChange={(value) => handleQuantityChange(record.id!, value)}
                        />

                        <Space>
                            / {record.quantity}
                        </Space>

                        <Button
                            style={{ height: '22px', width: '22px' }}
                            size="small" color="danger" variant="outlined"
                            onClick={() => handleQuantityChange(record.id!, Math.min(maxQuantity, currentValue + 1))}
                        >
                            <PlusOutlined style={{ width: 10 }} />
                        </Button>
                    </Flex>
                )
            }
        },
        {
            title: 'T.Tiền',
            dataIndex: 'price',
            key: 'price',
            width: 50,
            align: 'center',
            render: (_, record) => (
                <Space>
                    {formatPrice((splitQuantities[record.id!] || 0) * (record.unit?.price || 0))}
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
                width={600}
                open={isModalMerge}
                className='container-modal'
                onCancel={() => setIsModalMerge(false)}
                footer={[
                    <Button
                        onClick={() => {
                            setIsModalMerge(false)
                            setSelectedTables([]);
                            setSplitQuantities({});
                            setSelectedItemsToSplit([]);
                        }}
                    >
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