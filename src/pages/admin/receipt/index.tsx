import {
    Space,
    Button,
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { IReceipt } from "@/types/backend";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data-table";
import { paginationConfigure } from '@/utils/paginator';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { fetchReceiptByRestaurant } from "@/redux/slice/receiptSlide";

const ReceiptPage = () => {
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IReceipt | null>(null);

    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.receipt.meta);
    const receipts = useAppSelector(state => state.receipt.result);
    const isFetching = useAppSelector(state => state.receipt.isFetching);

    const columns: ProColumns<IReceipt>[] = [
        {
            title: 'Thời gian',
            dataIndex: 'createdDate',
            width: 150,
            sorter: true,
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Mã biên lai',
            key: 'id',
            align: "center",
            hideInSearch: true,
            render: (text, record, index) => {
                return (<> BL00{record.id}</>)
            },
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'type',
            sorter: true,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: ['supplier', 'id'],
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 90,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 20, color: '#ffa500' }}
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />
                </Space >
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let parts = [];
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.active !== undefined) {
            parts.push(`active = ${clone.active}`);
        }

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.active;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "active", "createdDate", "lastModifiedDate"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
        }

        // Thêm sắp xếp mặc định: active giảm dần (true đứng trước false) và createdDate tăng dần
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc&sort=createdDate,asc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.RECEIPTS.GET_PAGINATE}>
            <DataTable<IReceipt>
                rowKey="id"
                columns={columns}
                actionRef={tableRef}
                loading={isFetching}
                dataSource={receipts}
                headerTitle="Danh sách biên lai"
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchReceiptByRestaurant({ query }))
                }}
                pagination={paginationConfigure(meta)}
                toolBarRender={(action, rows): any => [
                    <Button type="primary" onClick={() => navigate('upsert')}>
                        <PlusOutlined />Tạo biên lai
                    </Button>
                ]}
            />
        </Access>
    )
}

export default ReceiptPage;