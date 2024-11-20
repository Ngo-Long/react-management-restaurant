import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUser } from "@/redux/slice/userSlide";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { userApi } from "@/config/api";
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import DataTable from "@/components/client/data-table";

const UserPage = () => {
    const tableRef = useRef<ActionType>();

    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const users = useAppSelector(state => state.user.result);

    const meta = useAppSelector(state => state.user.meta);
    const isFetching = useAppSelector(state => state.user.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDeleteUser = async (id: string | undefined) => {
        if (id) {
            const res = await userApi.callDelete(id);
            if (+res.statusCode === 200) {
                message.success('Xóa người dùng thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const columns: ProColumns<IUser>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },

        {
            title: 'Vị trí',
            dataIndex: ["role", "name"],
            sorter: true,
            hideInSearch: true
        },

        {
            title: 'Nhà hàng',
            dataIndex: ["restaurant", "name"],
            sorter: true,
            hideInSearch: true
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 200,
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
            width: 200,
            sorter: true,
            align: "center",
            render: (text, record, index, action) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.USERS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa người dùng"}
                            description={"Bạn có chắc chắn muốn xóa người dùng này ?"}
                            onConfirm={() => handleDeleteUser(entity.id)}
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
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        const clone = { ...params };
        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.email) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("email", clone.email)}`
                : `${sfLike("email", clone.email)}`;
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.email) {
            sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
        }
        if (sort && sort.createdDate) {
            sortBy = sort.createdDate === 'ascend' ? "sort=createdDate,asc" : "sort=createdDate,desc";
        }
        if (sort && sort.lastModifiedDate) {
            sortBy = sort.lastModifiedDate === 'ascend' ? "sort=lastModifiedDate,asc" : "sort=lastModifiedDate,desc";
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
            <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách người dùng"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={users}
                    request={
                        async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            dispatch(fetchUser({ query }))
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
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => setOpenModal(true)}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>

            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default UserPage;