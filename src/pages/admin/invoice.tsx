import dayjs from 'dayjs';
import { useState, useRef } from 'react';

import queryString from 'query-string';
import { IInvoice, IOrder } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";

import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";

import { orderApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrder, fetchOrderByRestaurant } from "@/redux/slice/orderSlide";

import { Button, Modal, Popconfirm, Space, message, notification } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { fetchInvoice } from '@/redux/slice/invoiceSlide';


const InvoicePage = () => {
    const tableRef = useRef<ActionType>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);

    const [dataInit, setDataInit] = useState<IInvoice | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const invoices = useAppSelector(state => state.invoice.result);

    const meta = useAppSelector(state => state.invoice.meta);
    const isFetching = useAppSelector(state => state.invoice.isFetching);

    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;


    const showModal = (invoice: IInvoice) => {
        setDataInit(invoice);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IInvoice>[] = [
        {
            title: 'Mã HD',
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
            title: 'Nguồn',
            dataIndex: ["order", "tableName"],
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Thu ngân',
            dataIndex: ["user", "name"],
            sorter: true,
            align: "center",
            hideInSearch: false,
        },
        {
            title: 'Tổng tiền',
            align: "center",
            dataIndex: 'totalAmount',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.totalAmount;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            render: (value) => {
                return value === 'PAID'
                    ? 'Đã thanh toán' : value === 'UNPAID'
                        ? 'Chưa thanh toán' : '';
            },
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PAID: 'Đã thanh toán',
                        UNPAID: 'Chưa thanh toán'
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 180,
            sorter: true,
            align: "center",
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD/MM/YYYY') : ""}</>
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
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD/MM/YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 120,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.INVOICES.GET_PAGINATE} hideChildren >
                        <Button type="primary" onClick={() => showModal(entity)}>
                            Chi tiết
                        </Button>
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
            <Access permission={ALL_PERMISSIONS.INVOICES.GET_PAGINATE}>
                <DataTable<IInvoice>
                    actionRef={tableRef}
                    headerTitle="Danh sách hóa đơn"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={invoices}
                    request={
                        async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            dispatch(fetchInvoice({ query }))
                            // (isRoleOwner
                            //     ? dispatch(fetchInvoice({ query }))
                            //     : dispatch(fetchInvoiceByRestaurant({ query }))
                            // )
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

            <Modal title={`Chi tiết hóa đơn [${dataInit?.id}]`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </div >
    )
}

export default InvoicePage;