import {
    Space,
    Button,
    message,
    Popconfirm,
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { feedbackApi } from '@/config/api';
import { ModalFeedback } from './container';
import { IFeedback } from '@/types/backend';
import Access from "@/components/share/access";
import DataTable from '@/components/client/data.table';
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from '@/utils/paginator';
import { fetchFeedback } from "@/redux/slice/feedbackSlide";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ActionType, ProColumns } from '@ant-design/pro-components';

const FeedbackPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const meta = useAppSelector(state => state.feedback.meta);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IFeedback | null>(null);
    const feedbacks = useAppSelector(state => state.feedback.result);
    const isFetching = useAppSelector(state => state.feedback.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDeleteFeedback = async (id: string | undefined) => {
        if (id) {
            await feedbackApi.callDelete(id);
            message.success('Xóa thành công');
            reloadTable();
        }
    }

    const columns: ProColumns<IFeedback>[] = [
        {
            width: 50,
            title: 'STT',
            key: 'index',
            align: "center",
            hideInSearch: true,
            render: (text, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)} </>)
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'subject',
            sorter: true,
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            sorter: true,
        },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            hideInSearch: true,
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
            width: 100,
            align: "center",
            render: (_, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.FEEDBACKS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.FEEDBACKS.DELETE} hideChildren >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa đánh giá"}
                            description={"Bạn có chắc chắn muốn xóa đánh giá này ?"}
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
        <Access permission={ALL_PERMISSIONS.FEEDBACKS.GET_PAGINATE}>
            <DataTable<IFeedback>
                rowKey="id"
                actionRef={tableRef}
                headerTitle="Danh sách đánh giá"
                loading={isFetching}
                columns={columns}
                dataSource={feedbacks}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchFeedback({ query }))
                }}
                pagination={paginationConfigure(meta)}
                toolBarRender={(): any => [
                    <Access permission={ALL_PERMISSIONS.FEEDBACKS.CREATE} hideChildren>
                        <Button type="primary" onClick={() => setOpenModal(true)}>
                            <PlusOutlined /> Thêm mới
                        </Button>
                    </Access>
                ]}
            />

            <ModalFeedback
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </Access>
    )
}

export default FeedbackPage;