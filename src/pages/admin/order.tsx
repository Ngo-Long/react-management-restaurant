import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import queryString from 'query-string';
import { IOrder } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";

import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
// import ModalDiningTable from '@/components/admin/diningTable/modal.dining.table';

import { orderApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrder, fetchOrderByRestaurant } from "@/redux/slice/orderSlide";

import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';


const OrderPage = () => {
    const tableRef = useRef<ActionType>();

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IOrder | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const orders = useAppSelector(state => state.order.result);

    const meta = useAppSelector(state => state.order.meta);
    const isFetching = useAppSelector(state => state.order.isFetching);

    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDeleteOrder = async (id: string | undefined) => {
        if (id) {
            const res = await orderApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa đơn hàng thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const columns: ProColumns<IOrder>[] = [
        {
            title: 'Đơn hàng',
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
            title: 'Ghi chú',
            dataIndex: 'note',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Bàn ăn',
            dataIndex: ["diningTable", "name"],
            sorter: true,
            align: "center",
            hideInSearch: false,
        },
        {
            title: 'Tổng tiền',
            width: 80,
            align: "center",
            dataIndex: 'totalPrice',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.totalPrice;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Nguồn',
            dataIndex: 'option',
            align: "center",
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        DINE_IN: 'Tại chỗ',
                        TAKEAWAY: 'Mang về'
                    }}
                    placeholder="Chọn nguồn"
                />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        COMPLETED: 'Hoàn thành',
                        PENDING: 'Đang làm'
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 150,
            sorter: true,
            align: "center",
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            sorter: true,
            align: "center",
            hidden: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Chi tiết',
            hideInSearch: true,
            width: 75,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access
                        permission={ALL_PERMISSIONS.ORDERS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa bàn ăn"}
                            description={"Bạn có chắc chắn muốn xóa bàn ăn này ?"}
                            onConfirm={() => handleDeleteOrder(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {

        const clone = { ...params };
        let parts = [];
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone?.status?.length) {
            parts.push(`${sfIn("status", clone.status).toString()}`);
        }

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.status;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "createdDate", "lastModifiedDate"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;  // Remove this if you want to handle multiple sort parameters
                }
            }
        }

        //mặc định sort theo lastModifiedDate
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=lastModifiedDate,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.ORDERS.GET_PAGINATE}>
                <DataTable<IOrder>
                    actionRef={tableRef}
                    headerTitle="Danh sách đơn hàng"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={orders}
                    request={
                        async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            (isRoleOwner
                                ? dispatch(fetchOrder({ query }))
                                : dispatch(fetchOrderByRestaurant({ query }))
                            )
                        }
                    }
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} hàng</div>) }
                        }
                    }
                    rowSelection={false}
                />
            </Access>

            {/* <ModalDiningTable
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            /> */}
        </div >
    )
}

export default OrderPage;