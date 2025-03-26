import {
    Space,
    Switch,
    Button,
    message,
    Popconfirm,
    notification
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import {
    ActionType,
    ProColumns
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { supplierApi } from "@/config/api";
import { ISupplier } from "@/types/backend";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data.table";
import { paginationConfigure } from '@/utils/paginator';
import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { ModalSupplier, ModalBatchImport } from './container';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSupplierByRestaurant } from "@/redux/slice/supplierSlide";

const SupplierPage = () => {
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();
    const [loading, setLoading] = useState<boolean>(false);

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ISupplier | null>(null);

    const meta = useAppSelector(state => state.supplier.meta);
    const suppliers = useAppSelector(state => state.supplier.result);
    const isFetching = useAppSelector(state => state.supplier.isFetching);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const formatCSV = (data: ISupplier[]) => {
        const excludeKeys = [
            'id', 'status', 'active', 'createdBy',
            'createdDate', 'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof ISupplier>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof ISupplier, any>)
        })
    }

    const batchImportConfigHandler = async (data: ISupplier[]) => {
        if (!data || data?.length <= 0) return;
        setLoading(true);

        const formattedData = data.map(item => ({
            ...item,
            active: true,
            restaurant: {
                id: currentRestaurant.id ?? '',
                name: currentRestaurant.name ?? ''
            }
        }));
        console.log('data: ', formattedData);

        try {
            await supplierApi.callBatchImport(formattedData);
            message.success('Nhập danh sách thành công');
            setOpenUpload(false);
            reloadTable();
        } catch (error) {
            console.error('Batch import failed:', error);
            message.error('Lỗi khi nhập danh sách, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    }

    const handleToggleActive = async (record: ISupplier, checked: boolean) => {
        const updatedRecord = { ...record, active: checked };
        const res = await supplierApi.callUpdate(updatedRecord);

        if (res && +res.statusCode === 200) {
            message.success('Cập nhật trạng thái thành công');
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra!',
                description: 'Không thể cập nhật trạng thái!'
            });
        }
    };

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
            render: (text, record) => {
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
            render: (text, record) => {
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
            render: (_value, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.SUPPLIERS.UPDATE} hideChildren>
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
                </Space>
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

        // active giảm dần (true đứng trước false)
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
        }
        return temp;
    }

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.SUPPLIERS.GET_PAGINATE}>
                <DataTable<ISupplier>
                    rowKey="id"
                    actionRef={tableRef}
                    headerTitle="Danh sách nhà cung cấp"
                    loading={isFetching}
                    columns={columns}
                    dataSource={suppliers}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchSupplierByRestaurant({ query }))
                    }}
                    pagination={paginationConfigure(meta)}
                    toolBarRender={(): any => [
                        <Button onClick={() => setOpenUpload(true)}>
                            <UploadOutlined /> Import
                        </Button>,

                        <Button onClick={handleExportAsXlsx(suppliers, formatCSV)}>
                            <DownloadOutlined /> Export
                        </Button>,

                        <Button type="primary" onClick={() => setOpenModal(true)}>
                            <PlusOutlined />  Thêm mới
                        </Button>
                    ]}
                />

                <ModalSupplier
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    reloadTable={reloadTable}
                    dataInit={dataInit}
                    setDataInit={setDataInit}
                />

                <ModalBatchImport
                    open={openUpload}
                    onOpen={setOpenUpload}
                    loading={loading}
                    onLoading={setLoading}
                    reloadTable={reloadTable}
                    onSubmit={(values) => {
                        batchImportConfigHandler(values);
                    }}
                />
            </Access>
        </div>
    )
}

export default SupplierPage;