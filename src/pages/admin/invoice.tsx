import {
    Tag,
    Modal,
    Space,
    Button,
} from "antd";
import {
    ActionType,
    ProColumns,
    ProFormSelect
} from '@ant-design/pro-components';
import {
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { IInvoice } from "@/types/backend";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import DataTable from "@/components/client/data-table";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { fetchInvoice } from '@/redux/slice/invoiceSlide';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

const InvoicePage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const meta = useAppSelector(state => state.invoice.meta);
    const invoices = useAppSelector(state => state.invoice.result);
    const isFetching = useAppSelector(state => state.invoice.isFetching);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataInit, setDataInit] = useState<IInvoice | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

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

    const columns: ProColumns<IInvoice>[] = [
        {
            title: 'Thời gian',
            dataIndex: 'createdDate',
            width: 180,
            sorter: true,
            align: "center",
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD/MM/YYYY') : ""}</>
                )
            },
        },
        {
            title: 'Mã HD',
            width: 80,
            align: "center",
            dataIndex: 'id',
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <div onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        HD00{record.id}
                    </div>
                )
            }
        },
        {
            title: 'Nguồn',
            dataIndex: ["order", "tableName"],
            align: "center",
            hideInSearch: true,
            render(_, entity) {
                const tableName = entity.order?.tableName || "-";
                return <>{tableName}</>;
            },
        },
        {
            title: 'Thu ngân',
            dataIndex: ["user", "name"],
            sorter: true,
            hideInSearch: false,
        },
        {
            title: 'Tổng tiền',
            align: "center",
            dataIndex: 'totalAmount',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.totalAmount;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            sorter: true,
            align: "center",
            hideInSearch: true,
            render(_, entity) {
                return <>
                    <Tag color={entity.method === "CASH" ? "green" : "red"} >
                        {entity.method}
                    </Tag>
                </>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    allowClear
                    valueEnum={{
                        PAID: 'Đã thanh toán',
                        UNPAID: 'Chưa thanh toán'
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
            render(_, entity) {
                return <>
                    <Tag
                        color={entity.status === "PAID" ? "#87d068" : "#f50"}
                        icon={entity.status === "PAID" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                        {entity.status}
                    </Tag>
                </>
            },
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            hidden: true,
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD/MM/YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 100,
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