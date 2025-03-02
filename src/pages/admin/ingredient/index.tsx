import {
    Button, Popconfirm, Space,
    Switch, message, notification
} from "antd";
import {
    DeleteOutlined, DownloadOutlined,
    EditOutlined, PlusOutlined, UploadOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { ingredientApi } from "@/config/api";
import { IIngredient } from "@/types/backend";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data-table";
import { paginationConfigure } from '@/utils/paginator';
import { convertCSV, handleExportAsXlsx } from "@/utils/file";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { fetchIngredientByRestaurant } from "@/redux/slice/ingredientSlide";
import { ModalBatchImport, ModalIngredient } from '@/pages/admin/ingredient/container';

const IngredientPage = () => {
    const tableRef = useRef<ActionType>();
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IIngredient | null>(null);

    const dispatch = useAppDispatch();
    const ingredients = useAppSelector(state => state.ingredient.result);
    const meta = useAppSelector(state => state.ingredient.meta);
    const isFetching = useAppSelector(state => state.ingredient.isFetching);
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const formatCSV = (data: IIngredient[]) => {
        const excludeKeys = [
            'id', 'status', 'active', 'createdBy',
            'createdDate', 'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof IIngredient>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof IIngredient, any>)
        })
    }

    const batchImportConfigHandler = async (data: IIngredient[]) => {
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
            await ingredientApi.callBatchImport(formattedData);
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

    const handleToggleActive = async (record: IIngredient, checked: boolean) => {
        const updatedRecord = { ...record, active: checked };
        const res = await ingredientApi.callUpdate(updatedRecord);

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

    const handleDeleteIngredient = async (id: string | undefined) => {
        if (id) {
            const res = await ingredientApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa nguyên liệu thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const columns: ProColumns<IIngredient>[] = [
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
            title: 'Tên nguyên liệu',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Phân loại',
            dataIndex: 'type',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Giá vốn',
            align: "center",
            dataIndex: 'price',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.price;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'SL hiện tại',
            align: "center",
            dataIndex: 'initialQuantity',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.initialQuantity;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'SL tối thiểu',
            align: "center",
            dataIndex: 'minimumQuantity',
            hideInSearch: true,
            render(_, entity) {
                const str = "" + entity.minimumQuantity;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
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
            render: (_, record) => {
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
            render: (_, record) => {
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
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access permission={ALL_PERMISSIONS.INGREDIENTS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.INGREDIENTS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa hàng hóa"}
                            description={"Bạn có chắc chắn muốn xóa hàng hóa này ?"}
                            onConfirm={() => handleDeleteIngredient(entity.id)}
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
        const fields = ["name", "active", "createdDate", "lastModifiedDate"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
        }

        // Thêm sắp xếp mặc định: active giảm dần (true đứng trước false) và createdDate tăng dần
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc&sort=createdDate,asc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.INGREDIENTS.GET_PAGINATE}>
            <DataTable<IIngredient>
                actionRef={tableRef}
                headerTitle="Danh sách nguyên liệu"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={ingredients}
                request={
                    async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchIngredientByRestaurant({ query }))
                    }
                }
                pagination={paginationConfigure(meta)}
                rowSelection={false}
                toolBarRender={(action, rows): any => [
                    <Button onClick={() => setOpenUpload(true)}>
                        <UploadOutlined /> Import
                    </Button>,

                    <Button onClick={handleExportAsXlsx(ingredients, formatCSV)}>
                        <DownloadOutlined /> Export
                    </Button>,

                    <Button type="primary" onClick={() => setOpenModal(true)} >
                        <PlusOutlined /> Thêm mới
                    </Button>
                ]}
            />

            <ModalIngredient
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

export default IngredientPage;