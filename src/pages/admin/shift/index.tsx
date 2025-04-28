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
} from "@ant-design/icons";

import dayjs from 'dayjs';
import { useState, useRef, useEffect } from 'react';
import { shiftApi } from '@/config/api';
import { ModalShift } from './container';
import { IShift } from '@/types/backend';
import Access from "@/components/share/access";
import DataTable from '@/components/client/data.table';
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from '@/utils/paginator';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ActionType, ProColumns } from '@ant-design/pro-components';

const ShiftPage = () => {
    const tableRef = useRef<ActionType>();
    const meta = useAppSelector(state => state.shift.meta);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IShift | null>(null);
    const isFetching = useAppSelector(state => state.shift.isFetching);
    const [data, setData] = useState<IShift[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setFetching(true);
            const res = await shiftApi.callFetchByRestaurant('');
            if (res.data) {
                console.log(res.data.result);
                setData(res.data.result);
            }
            setFetching(false);
        } catch (error) {
            console.log(error);
        }
    }

    const reloadTable = () => {
        fetchData();
        tableRef?.current?.reload();
    }

    const handleDeleteShift = async (id: string | undefined) => {
        if (id) {
            await shiftApi.callDelete(id);
            message.success('Xóa thành công');
            reloadTable();
        }
    }

    const columns: ProColumns<IShift>[] = [
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
            title: 'Tên ca',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Giờ vào',
            dataIndex: 'inTime',
            sorter: true,
            render: (_, record) => {
                return record.inTime ? dayjs(record.inTime).format('HH:mm') : "";
            }
        },
        {
            title: 'Giờ ra',
            dataIndex: 'outTime',
            sorter: true,
            render: (_, record) => {
                console.log(record.outTime);
                return record.outTime ? dayjs(record.outTime).format('HH:mm') : "";
            }
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            sorter: true,
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
                            title={"Xác nhận xóa ca làm"}
                            description={"Bạn có chắc chắn muốn xóa ca làm này ?"}
                            onConfirm={() => handleDeleteShift(entity.id)}
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

    return (
        <Access permission={ALL_PERMISSIONS.SHIFTS.GET_PAGINATE}>
            <DataTable<IShift>
                rowKey="id"
                actionRef={tableRef}
                headerTitle="Danh sách ca làm"
                loading={fetching}
                columns={columns}
                dataSource={data}
                request={async (params, sort, filter): Promise<any> => {
                    fetchData();
                }}
                pagination={paginationConfigure(meta)}
                toolBarRender={(): any => [
                    <Access permission={ALL_PERMISSIONS.SHIFTS.CREATE}>
                        <Button type="primary" onClick={() => setOpenModal(true)} >
                            <PlusOutlined /> Thêm mới
                        </Button>
                    </Access>
                ]}
            />

            <ModalShift
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </Access>
    )
}

export default ShiftPage;