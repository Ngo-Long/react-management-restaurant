import {
    Button,
    Space,
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
    ProColumns
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { colorMethod } from "@/utils/format";
import { permissionApi } from "@/config/api";
import { IPermission } from "@/types/backend";
import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from "@/utils/paginator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchPermission } from "@/redux/slice/permissionSlide";
import ModalPermission from "@/components/admin/permission/modal.permission";
import ViewDetailPermission from "@/components/admin/permission/view.permission";

const PermissionPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IPermission | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const meta = useAppSelector(state => state.permission.meta);
    const permissions = useAppSelector(state => state.permission.result);

    const isFetching = useAppSelector(state => state.permission.isFetching);
    const userRoleId = Number(useAppSelector(state => state.account.user?.role?.id));

    const handleDeletePermission = async (id: string | undefined) => {
        if (id) {
            const res = await permissionApi.callDelete(id);
            if (res && res.statusCode === 200) {
                message.success('Xóa quyền hạn thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.error
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IPermission>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 50,
            align: "center",
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
        },
        {
            title: 'Quyền hạn',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'API',
            dataIndex: 'apiPath',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            sorter: true,
            align: "center",
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                return (
                    <p style={{ paddingLeft: 10, fontWeight: 'bold', marginBottom: 0, color: colorMethod(entity?.method as string) }}>{entity?.method || ''}</p>
                )
            },
        },
        {
            title: 'Mô hình',
            dataIndex: 'module',
            sorter: true,
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 170,
            sorter: true,
            align: "center",
            hidden: true,
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
            width: 170,
            sorter: true,
            align: "center",
            hidden: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Tác vụ',
            hideInSearch: true,
            width: 90,
            align: "center",
            hidden: (userRoleId == 1 ? false : true),
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access>

                    <Access permission={ALL_PERMISSIONS.PERMISSIONS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa quyền hạn"}
                            description={"Bạn có chắc chắn muốn xóa quyền hạn này ?"}
                            onConfirm={() => handleDeletePermission(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                        </Popconfirm>
                    </Access>
                </Space>
            )
        }
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };

        let parts = [];
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.apiPath) parts.push(`apiPath ~ '${clone.apiPath}'`);
        if (clone.method) parts.push(`method ~ '${clone.method}'`);
        if (clone.module) parts.push(`module ~ '${clone.module}'`);

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.apiPath;
        delete clone.method;
        delete clone.module;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "apiPath", "method", "module", "createdAt", "lastModifiedDate"];

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
            <Access
                permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}
            >
                <DataTable<IPermission>
                    rowKey="id"
                    columns={columns}
                    actionRef={tableRef}
                    loading={isFetching}
                    dataSource={permissions}
                    headerTitle="Danh sách quyền hạn"
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchPermission({ query }))
                    }}
                    pagination={paginationConfigure(meta)}
                    toolBarRender={(_action, _rows): any => [
                        <Access permission={ALL_PERMISSIONS.PERMISSIONS.CREATE} hideChildren>
                            <Button type="primary" onClick={() => setOpenModal(true)}>
                                <PlusOutlined /> Thêm mới
                            </Button>
                        </Access>
                    ]}
                />
            </Access>

            <ModalPermission
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailPermission
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default PermissionPage;