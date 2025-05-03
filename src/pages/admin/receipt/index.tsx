import {
    Space,
    Button,
    Tag,
    Badge,
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    ActionType,
    ProColumns
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { IReceipt } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data.table";
import { paginationConfigure } from '@/utils/paginator';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchReceiptByRestaurant } from "@/redux/slice/receiptSlide";

const ReceiptPage = () => {
    const navigate = useNavigate();
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
            width: 160,
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss - DD/MM/YYYY') : ""}</>
                )
            },
        },
        {
            title: 'Mã BL',
            key: 'id',
            align: "center",
            width: 70,
            hideInSearch: true,
            render: (_, record) => {
                return (<> {record.id}</>)
            },
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'type',
            width: 110,
            align: "center",
            render: (_, record) => {
                let color = '';
                let text = '';
                
                switch (record.type) {
                    case 'IN': 
                        color = 'green';
                        text = 'Phiếu nhập';
                        break;
                    case 'OUT': 
                        color = 'volcano';
                        text = 'Phiếu trả';
                        break;
                    case 'TEMPORARY': 
                        color = 'orange';
                        text = 'Phiếu tạm';
                        break;
                    default: 
                        color = 'default';
                }
                
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: ['supplier', 'name'],
            hideInSearch: true,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            align: "center",
            hideInSearch: true,
            width: 100
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            hideInSearch: true,
            width: 140,
            render: (_, record) => {
                let statusText = '';
                let statusColor = '';
        
                switch (record.status) {
                    case 'PAID':
                        statusText = 'Đã thanh toán';
                        statusColor = '#52c41a';
                        break;
                    case 'UNPAID':
                        statusText = 'Chưa thanh toán';
                        statusColor = 'red';
                        break;
                    case 'PENDING':
                        statusText = 'Đang chuẩn bị';
                        statusColor = 'orange';
                        break;
                    case 'CANCELLED':
                        statusText = 'Đã hủy';
                        statusColor = 'gray';
                        break;
                    default:
                        statusColor = 'blue';
                }
        
                return (
                    <Badge 
                        color={statusColor} 
                        text={
                            <span style={{ color: statusColor, fontWeight: 500 }}>
                                {statusText}
                            </span>
                        } 
                    />
                );
            }
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 80,
            align: "center",
            render: (_, entity) => (
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
                    <Access permission={ALL_PERMISSIONS.RECEIPTS.CREATE}>
                        <Button type="primary" onClick={() => navigate('upsert')}>
                            <PlusOutlined />Tạo biên lai
                        </Button>
                    </Access>
                ]}
            />
        </Access>
    )
}

export default ReceiptPage;