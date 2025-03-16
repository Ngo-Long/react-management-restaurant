import {
    Space,
    Button,
    message,
    Popconfirm,
    notification
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    ActionType,
    ProColumns,
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import moment from "moment";
import { userApi } from "@/config/api";
import queryString from 'query-string';
import { IUser } from "@/types/backend";
import { useState, useRef } from 'react';
import Access from "@/components/share/access";
import { sfLike } from "spring-filter-query-builder";
import DataTable from "@/components/client/data.table";
import { paginationConfigure } from "@/utils/paginator";
import { ALL_PERMISSIONS } from "@/config/permissions";
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserByRestaurant } from "@/redux/slice/userSlide";

const UserPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const meta = useAppSelector(state => state.user.meta);
    const isFetching = useAppSelector(state => state.user.isFetching);

    const userList = useAppSelector(state => state.user.result);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

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
            hideInSearch: true,
            render: (text, record, index) => {
                return (<>{(index + 1) + (meta.page - 1) * (meta.pageSize)}</>)
            },
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Chức vụ',
            dataIndex: ["role", "name"],
            sorter: true,
            align: "center",
            hideInSearch: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },
        {
            title: 'SĐT',
            dataIndex: 'phoneNumber',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birthDate',
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                return moment(record.birthDate).format('DD-MM-YYYY');
            },
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            hideInSearch: true,
            align: "center",
            render: (_, record) => {
                switch (record.gender) {
                    case 'MALE': return 'Nam';
                    case 'FEMALE': return 'Nữ';
                    case 'OTHER': return 'Khác';
                    default: return record.gender;
                }
            }
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            dataIndex: 'address',
            hideInSearch: true,
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdDate',
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD-MM-YYYY') : ""}</>
                )
            },
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            hidden: true,
            hideInSearch: true,
            render: (text, record) => {
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
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
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
                            <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
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

        if (params.name) {
            q.filter = q.filter
                ? `${q.filter} and ${sfLike("name", params.name)}`
                : `${sfLike("name", params.name)}`;
        }
        if (params.email) {
            q.filter = q.filter
                ? `${q.filter} and ${sfLike("email", params.email)}`
                : `${sfLike("email", params.email)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);
        let sortBy = "";

        if (sort && sort.name) {
            sortBy = sort.name === "ascend" ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.email) {
            sortBy = sort.email === "ascend" ? "sort=email,asc" : "sort=email,desc";
        }
        if (sort && sort.createdDate) {
            sortBy = sort.createdDate === 'ascend' ? "sort=createdDate,asc" : "sort=createdDate,desc";
        }
        if (sort && sort.lastModifiedDate) {
            sortBy = sortBy = sort.lastModifiedDate === 'ascend' ? "sort=lastModifiedDate,asc" : "sort=lastModifiedDate,desc";
        }

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=lastModifiedDate,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
            <DataTable<IUser>
                rowKey="id"
                actionRef={tableRef}
                headerTitle="Danh sách người dùng"
                loading={isFetching}
                columns={columns}
                dataSource={userList}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchUserByRestaurant({ query }))
                }}
                pagination={paginationConfigure(meta)}
                rowSelection={false}
                toolBarRender={(_action, _rows): any => [
                    <Button type="primary" onClick={() => setOpenModal(true)}>
                        <PlusOutlined /> Thêm mới
                    </Button>
                ]}
            />

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
        </Access>
    )
}

export default UserPage;