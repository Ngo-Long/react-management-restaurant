import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import queryString from 'query-string';
import { IDiningTable } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";

import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
import ModalDiningTable from '@/components/admin/diningTable/modal.dining.table';

import { diningTableApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchDiningTable, fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";

import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';

const DiningTablePage = () => {
    const tableRef = useRef<ActionType>();

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IDiningTable | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const diningTables = useAppSelector(state => state.diningTable.result);

    const meta = useAppSelector(state => state.diningTable.meta);
    const isFetching = useAppSelector(state => state.diningTable.isFetching);

    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDeleteDiningTable = async (id: string | undefined) => {
        if (id) {
            const res = await diningTableApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa bàn ăn thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const columns: ProColumns<IDiningTable>[] = [
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
            title: 'Tên bàn ăn',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Nhà hàng',
            dataIndex: ["restaurant", "name"],
            sorter: true,
            hidden: !isRoleOwner,
            hideInSearch: true,
        },
        {
            title: 'Số ghế',
            width: 80,
            align: "center",
            dataIndex: 'seats',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.seats;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: "center",
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        AVAILABLE: 'Còn trống',
                        OCCUPIED: 'Đã có khách',
                        RESERVED: 'Đã đặt trước'
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 150,
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
            width: 150,
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
                    < Access
                        permission={ALL_PERMISSIONS.DININGTABLES.UPDATE}
                        hideChildren
                    >
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

                    <Access
                        permission={ALL_PERMISSIONS.DININGTABLES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa bàn ăn"}
                            description={"Bạn có chắc chắn muốn xóa bàn ăn này ?"}
                            onConfirm={() => handleDeleteDiningTable(entity.id)}
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
            <Access permission={ALL_PERMISSIONS.DININGTABLES.GET_PAGINATE}>
                <DataTable<IDiningTable>
                    actionRef={tableRef}
                    headerTitle="Danh sách bàn ăn"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={diningTables}
                    request={
                        async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            (isRoleOwner
                                ? dispatch(fetchDiningTable({ query }))
                                : dispatch(fetchDiningTableByRestaurant({ query })))
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

            <ModalDiningTable
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default DiningTablePage;