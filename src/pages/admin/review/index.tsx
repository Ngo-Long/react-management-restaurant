import {
    Space,
    Button,
    Switch,
    message,
    Popconfirm,
    notification
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import {
    ActionType,
    ProColumns
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { reviewApi } from '@/config/api';
import { IReview } from '@/types/backend';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from '@/utils/paginator';
import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchReview } from "@/redux/slice/reviewSlide";
import DataTable from "@/components/client/data.table";
import { ModalReview } from "./container";

const ReviewPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const meta = useAppSelector(state => state.review.meta);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IReview | null>(null);
    const reviews = useAppSelector(state => state.review.result);
    const isFetching = useAppSelector(state => state.review.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleToggleActive = async (record: IReview, checked: boolean) => {
        const updatedRecord = { ...record, active: checked };
        await reviewApi.callUpdate(updatedRecord);
        message.success('Cập nhật trạng thái thành công');
        reloadTable();
    };

    const handleDeleteFeedback = async (id: string | undefined) => {
        if (id) {
            await reviewApi.callDelete(id);
            message.success('Xóa bài thành công');
            reloadTable();
        }
    }

    const formatCSV = (data: IReview[]) => {
        const excludeKeys = [
            'id', 'status', 'active', 'createdBy',
            'createdDate', 'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof IReview>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof IReview, any>)
        })
    }

    const columns: ProColumns<IReview>[] = [
        {
            title: '#',
            key: 'index',
            width: 50,
            align: "center",
            render: (_, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)}</>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            sorter: true,
        },
        {
            title: 'Mô tả',
            align: "center",
            dataIndex: 'description',
            hideInSearch: true,

        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Màu nền',
            dataIndex: 'background_color',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            hideInSearch: true,
            render: (_, record, index) => [
                <Switch
                    key={`switch-${index + 1}`}
                    defaultChecked={record?.active}
                    onChange={(checked: boolean) => handleToggleActive(record, checked)}
                />
            ]
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            hidden: true,
            hideInSearch: true,
            render: (_, record) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD-MM-YYYY') : ""}</>
                )
            }
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            hidden: true,
            hideInSearch: true,
            render: (_, record) => {
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
            render: (_, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.DININGTABLES.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.DININGTABLES.DELETE} hideChildren >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa bàn ăn"}
                            description={"Bạn có chắc chắn muốn xóa bàn ăn này ?"}
                            onConfirm={() => handleDeleteFeedback(entity.id)}
                            okText="Xác nhận"
                            cancelText="Đóng"
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
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
        const fields = ["name", "createdDate", "lastModifiedDate"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.REVIEWS.GET_PAGINATE}>
            <DataTable<IReview>
                rowKey="id"
                actionRef={tableRef}
                headerTitle="Danh sách bàn ăn"
                loading={isFetching}
                columns={columns}
                dataSource={reviews}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchReview({ query }))
                }}
                pagination={paginationConfigure(meta)}
                toolBarRender={(): any => [
                    <Button onClick={handleExportAsXlsx(reviews, formatCSV)}>
                        <DownloadOutlined /> Export
                    </Button>,

                    <Access permission={ALL_PERMISSIONS.REVIEWS.CREATE}>
                        <Button type="primary" onClick={() => setOpenModal(true)} >
                            <PlusOutlined /> Thêm mới
                        </Button>
                    </Access>
                ]}
            />

            <ModalReview
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

        </Access>
    )
}

export default ReviewPage;

