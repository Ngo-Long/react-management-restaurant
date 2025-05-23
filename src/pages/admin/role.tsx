import DataTable from "@/components/client/data.table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IPermission, IRole } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { roleApi, permissionApi } from "@/config/api";
import queryString from 'query-string';
import { fetchRole } from "@/redux/slice/roleSlide";
import ModalRole from "@/components/admin/role/modal.role";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfLike } from "spring-filter-query-builder";
import { groupByPermission } from "@/utils/format";
import { paginationConfigure } from "@/utils/paginator";

const RolePage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);

    const meta = useAppSelector(state => state.role.meta);
    const roles = useAppSelector(state => state.role.result);
    const isFetching = useAppSelector(state => state.role.isFetching);
    const userRoleId = Number(useAppSelector(state => state.account.user?.role?.id));
    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;

    // all backend permissions
    const [listPermissions, setListPermissions] = useState<{
        module: string;
        permissions: IPermission[]
    }[] | null>(null);

    // current role
    const [singleRole, setSingleRole] = useState<IRole | null>(null);

    useEffect(() => {
        const init = async () => {
            const res = await permissionApi.callFetchFilter(`page=1&size=100`);
            if (res.data?.result) setListPermissions(groupByPermission(res.data?.result!));
        }
        init();
    }, [])


    const handleDeleteRole = async (id: string | undefined) => {
        if (id) {
            const res = await roleApi.callDelete(id);
            if (res && res.statusCode === 200) {
                message.success('Xóa chức vụ thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IRole>[] = [
        {
            title: '#',
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
            title: 'Nhà hàng',
            dataIndex: ["restaurant", "name"],
            sorter: true,
            align: "center",
            hideInSearch: !isRoleOwner,
            hidden: true
        },
        {
            title: 'Chức vụ',
            dataIndex: 'name',
            sorter: true,
            align: "center",
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            hideInSearch: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            align: "center",
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
            hideInSearch: false,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 200,
            sorter: true,
            align: "center",
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            width: 200,
            sorter: true,
            hidden: false,
            align: "center",
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
        },
        {

            title: 'Tác vụ',
            width: 90,
            align: "center",
            hideInSearch: true,
            hidden: (userRoleId == 1 ? false : true),
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.ROLES.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setSingleRole(entity);
                                setOpenModal(true);
                            }}
                        />
                    </Access>

                    <Access permission={ALL_PERMISSIONS.ROLES.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa chức vụ"}
                            description={"Bạn có chắc chắn muốn xóa chức vụ này ?"}
                            onConfirm={() => handleDeleteRole(entity.id)}
                            okText="Xác nhận"
                            cancelText="Đóng"
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                        </Popconfirm>
                    </Access>
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
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
        <Access permission={ALL_PERMISSIONS.ROLES.GET_PAGINATE}>
            <DataTable<IRole>
                actionRef={tableRef}
                headerTitle="Danh sách vai trò"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={roles}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchRole({ query }))
                }}
                pagination={paginationConfigure(meta)}
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <Access permission={ALL_PERMISSIONS.ROLES.CREATE} hideChildren>
                            <Button type="primary" onClick={() => setOpenModal(true)} >
                                <PlusOutlined />  Thêm mới
                            </Button>
                        </Access>
                    );
                }}
            />

            <ModalRole
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                listPermissions={listPermissions!}
                singleRole={singleRole}
                setSingleRole={setSingleRole}
            />
        </Access>
    )
}

export default RolePage;