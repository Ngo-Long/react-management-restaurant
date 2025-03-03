import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    Button, Popconfirm, Space,
    Switch, message, notification
} from "antd";
import {
    DeleteOutlined, DownloadOutlined,
    EditOutlined, PlusOutlined, UploadOutlined
} from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';

import { diningTableApi } from '@/config/api';
import { IDiningTable } from '@/types/backend';
import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from '@/utils/paginator';
import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { ModalBatchImport, ModalDiningTable } from './container';
import { fetchDiningTableByRestaurant } from "@/redux/slice/diningTableSlide";

const DiningTablePage = () => {
    const tableRef = useRef<ActionType>();
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openUpload, setOpenUpload] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.diningTable.meta);
    const [dataInit, setDataInit] = useState<IDiningTable | null>(null);
    const diningTables = useAppSelector(state => state.diningTable.result)
        .filter(table => table.name!.toLowerCase() !== "mang về");
    const isFetching = useAppSelector(state => state.diningTable.isFetching);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const fetch = () => {
        setLoading(true);
        dispatch(fetchDiningTableByRestaurant({ query: '' }));
    };

    const handleToggleActive = async (record: IDiningTable, checked: boolean) => {
        const updatedRecord = { ...record, active: checked };
        const res = await diningTableApi.callUpdate(updatedRecord);

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

    const formatCSV = (data: IDiningTable[]) => {
        const excludeKeys = [
            'id', 'status', 'active', 'createdBy',
            'createdDate', 'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof IDiningTable>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof IDiningTable, any>)
        })
    }

    const batchImportConfigHandler = async (data: IDiningTable[]) => {
        if (!data || data?.length <= 0) return;
        setLoading(true);

        const formattedData = data.map(item => ({
            ...item,
            status: 'AVAILABLE',
            active: true,
            restaurant: {
                id: currentRestaurant.id ?? '',
                name: currentRestaurant.name ?? ''
            }
        }));
        console.log('data: ', formattedData);

        try {
            await diningTableApi.callBatchImport(formattedData);
            message.success('Nhập danh sách thành công');
            setOpenUpload(false);
            fetch();
        } catch (error) {
            console.error('Batch import failed:', error);
            message.error('Lỗi khi nhập danh sách, vui lòng thử lại!');
        } finally {
            setLoading(false);
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

        // active giảm dần (true đứng trước false)
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc&sort=sequence,asc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
        }
        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.DININGTABLES.GET_PAGINATE}>
            <DataTable<IDiningTable>
                rowKey="id"
                actionRef={tableRef}
                headerTitle="Danh sách bàn ăn"
                loading={isFetching}
                columns={columns}
                dataSource={diningTables}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchDiningTableByRestaurant({ query }))
                }}
                pagination={paginationConfigure(meta)}
                toolBarRender={(): any => [
                    <Button onClick={() => setOpenUpload(true)}>
                        <UploadOutlined /> Import
                    </Button>,

                    <Button onClick={handleExportAsXlsx(diningTables, formatCSV)}>
                        <DownloadOutlined /> Export
                    </Button>,

                    <Button type="primary" onClick={() => setOpenModal(true)} >
                        <PlusOutlined /> Thêm mới
                    </Button>
                ]}
            />

            <ModalDiningTable
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
    )
}

export default DiningTablePage;