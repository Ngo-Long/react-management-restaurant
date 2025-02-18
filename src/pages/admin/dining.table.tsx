import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { IDiningTable } from "@/types/backend";
import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
import ModalDiningTable from '@/components/admin/diningTable/modal.dining.table';

import { diningTableApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';

const DiningTablePage = () => {
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IDiningTable | null>(null);

    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.diningTable.meta);
    const diningTables = useAppSelector(state => state.diningTable.result);
    const isFetching = useAppSelector(state => state.diningTable.isFetching);

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
                    description: 'Bàn đã được sử dụng không thể xóa được!'
                });
            }
        }
    }

    const columns: ProColumns<IDiningTable>[] = [
        {
            title: 'STT',
            align: "center",
            dataIndex: 'sequence',
            width: 70,
            sorter: true,
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.sequence;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Tên bàn ăn',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Số ghế',
            align: "center",
            dataIndex: 'seats',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.seats;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Vị trí',
            dataIndex: 'location',
            align: "center",
            hideInSearch: true,
        },
        // {
        //     title: 'Trạng thái',
        //     dataIndex: 'status',
        //     align: "center",
        //     renderFormItem: () => (
        //         <ProFormSelect
        //             showSearch
        //             allowClear
        //             valueEnum={{
        //                 AVAILABLE: 'Còn trống',
        //                 OCCUPIED: 'Đã có khách',
        //                 RESERVED: 'Đã đặt trước'
        //             }}
        //             placeholder="Chọn trạng thái"
        //         />
        //     ),
        // },
        {
            title: 'Hoạt động',
            align: "center",
            sorter: true,
            dataIndex: 'active',
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    allowClear
                    valueEnum={{
                        true: 'Hoạt động',
                        false: 'Ngưng hoạt động'
                    }}
                    placeholder="Chọn hoạt động"
                />
            ),
            render(_, entity) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
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
                            title={"Xác nhận xóa bàn ăn"}
                            description={"Bạn có chắc chắn muốn xóa bàn ăn này ?"}
                            onConfirm={() => handleDeleteDiningTable(entity.id)}
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
        const fields = ["sequence", "name", "createdDate", "lastModifiedDate"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
        }

        // Thêm sắp xếp mặc định: active giảm dần (true đứng trước false)
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc&sort=sequence,asc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
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
                            dispatch(fetchDiningTableByRestaurant({ query }))
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