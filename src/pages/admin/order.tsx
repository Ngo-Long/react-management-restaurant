import {
    Space,
    Popconfirm,
    Badge,
} from "antd";
import {
    ActionType,
    ProColumns,
    ProFormSelect,
} from '@ant-design/pro-components';
import {
    InfoCircleOutlined
} from "@ant-design/icons";

import dayjs from 'dayjs';
import queryString from 'query-string';
import { IOrder } from "@/types/backend";
import Access from "@/components/share/access";
import DataTable from "@/components/client/data.table";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrderByRestaurant } from "@/redux/slice/orderSlide";
import { paginationConfigure } from "@/utils/paginator";
import { useRef, useState } from "react";

const OrderPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IOrder | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const meta = useAppSelector(state => state.order.meta);
    const orders = useAppSelector(state => state.order.result);
    const isFetching = useAppSelector(state => state.order.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IOrder>[] = [
        {
            title: 'Mã ĐH',
            width: 80,
            align: "center",
            dataIndex: 'id',
            render: (text, record, index, action) => {
                return (
                    <div onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </div>
                )
            },
            hideInSearch: false,
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'reservationTime',
            sorter: true,
            align: "center",
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('DD/MM/YYYY - HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Thời gian đến',
            dataIndex: 'reservationTime',
            sorter: true,
            align: "center",
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.reservationTime ? dayjs(record.reservationTime).format('DD/MM/YYYY - HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Phòng/bàn',
            dataIndex: 'diningTables',
            hideInSearch: false,
            render(_, entity) {
                return <>{entity.diningTables?.map(t => t.name).join(', ')}</>
            },
        },
        {
            title: 'Khách hàng',
            dataIndex: "user",
            hideInSearch: false,
            render(_, entity) {
                return <>{entity.user?.name}</>
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            hideInSearch: true,
        },
        {
            title: 'Tổng tiền',
            align: "center",
            dataIndex: 'totalPrice',
            hideInSearch: true,
            render(dom, entity) {
                const str = "" + entity.totalPrice;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            render: (status) => {
                const statusConfig = {
                    RESERVED: { color: '#fa8c16', text: 'Đang chờ' },
                    PENDING: { color: '#52c41a', text: 'Đã nhận bàn' },
                    CANCELED: { color: '#ff4d4f', text: 'Đã hủy' },
                } as const;
                const config = statusConfig[status as keyof typeof statusConfig] || { color: '#fa8c16', text: 'Đã hủy' };

                return (
                    <Space>
                        <Badge color={config.color} />
                        <span style={{ fontWeight: 500, color: config.color }}>
                            {config.text}
                        </span>
                    </Space>
                );
            },
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            hidden: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 90,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.ORDERS.DELETE} hideChildren>
                        <Popconfirm
                            okText="Xác nhận"
                            cancelText="Hủy"
                            placement="leftTop"
                            title={"Xác nhận xóa bàn ăn"}
                            description={"Bạn có chắc chắn muốn xóa bàn ăn này ?"}
                        >
                            <InfoCircleOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#444',
                                    cursor: "pointer",
                                    padding: "0 10px"
                                }}
                            />
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        // const clone = { ...params };
        // let parts = [];
        // if (clone.name) parts.push(`name ~ '${clone.name}'`);
        // if (clone?.status?.length) {
        //     parts.push(`${sfIn("status", clone.status).toString()}`);
        // }

        // clone.filter = parts.join(' and ');
        // if (!clone.filter) delete clone.filter;

        // clone.page = clone.current;
        // clone.size = clone.pageSize;

        // delete clone.current;
        // delete clone.pageSize;
        // delete clone.name;
        // delete clone.status;

        // let temp = queryString.stringify(clone);

        // let sortBy = "";
        // const fields = ["name", "createdDate", "lastModifiedDate"];
        // if (sort) {
        //     for (const field of fields) {
        //         if (sort[field]) {
        //             sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
        //             break;  // Remove this if you want to handle multiple sort parameters
        //         }
        //     }
        // }

        // //mặc định sort theo lastModifiedDate
        // if (Object.keys(sortBy).length === 0) {
        //     temp = `${temp}&sort=lastModifiedDate,desc`;
        // } else {
        //     temp = `${temp}&${sortBy}`;
        // }

        // return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.ORDERS.GET_PAGINATE}>
            <DataTable<IOrder>
                rowKey="OrderId"
                headerTitle="Danh sách lịch đặt"
                columns={columns}
                dataSource={orders}
                actionRef={tableRef}
                loading={isFetching}
                pagination={paginationConfigure(meta)}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchOrderByRestaurant({ query: "filter=option~'TAKEAWAY'&sort=reservationTime,asc" }))
                }}
            />

            {/* <ModalDiningTable
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            /> */}
        </Access>
    )
}

export default OrderPage;