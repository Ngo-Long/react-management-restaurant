import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import Access from "@/components/share/access";
import { supplierApi } from "@/config/api";
import { ISupplier } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data-table";
import ModalSupplier from '@/components/admin/supplier/modal.supplier';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSupplierByRestaurant } from "@/redux/slice/supplierSlide";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';

const SupplierPage = () => {
    const tableRef = useRef<ActionType>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ISupplier | null>(null);
    const dispatch = useAppDispatch();
    const suppliers = useAppSelector(state => state.supplier.result);
    const meta = useAppSelector(state => state.supplier.meta);
    const isFetching = useAppSelector(state => state.supplier.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleDeleteSupplier = async (id: string | undefined) => {
        if (id) {
            const res = await supplierApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa nhà cung cấp thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const columns: ProColumns<ISupplier>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)}</>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            sorter: true,
            align: "center",
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            align: "center",
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            sorter: true,
            align: "center",
        },
        {
            title: 'Tiền nợ',
            align: "center",
            dataIndex: 'debtAmount',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.debtAmount;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Tổng đã mua',
            align: "center",
            dataIndex: 'totalAmount',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.totalAmount;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            hideInSearch: false,
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
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
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD-MM-YYYY') : ""}</>
                )
            },
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            width: 150,
            sorter: true,
            hidden: true,
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
            hideInSearch: true,
            width: 90,
            align: "center",
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access permission={ALL_PERMISSIONS.SUPPLIERS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.SUPPLIERS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa nhà cung cấp"}
                            description={"Bạn có chắc chắn muốn xóa nhà cung cấp này ?"}
                            onConfirm={() => handleDeleteSupplier(entity.id)}
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
                    break;
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
            {/* <Access permission={ALL_PERMISSIONS.SUPPLIERS.GET_PAGINATE}> */}
            <DataTable<ISupplier>
                actionRef={tableRef}
                headerTitle="Danh sách nhà cung cấp"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={suppliers}
                request={
                    async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchSupplierByRestaurant({ query }))
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
                            type="primary" icon={<PlusOutlined />}
                            onClick={() => setOpenModal(true)}
                        >
                            Thêm mới
                        </Button>
                    );
                }}
            />
            {/* </Access> */}

            <ModalSupplier
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default SupplierPage;