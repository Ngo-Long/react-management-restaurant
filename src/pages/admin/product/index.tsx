import {
    Tag,
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
    DeleteOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import {
    ProColumns,
    ActionType
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { productApi } from '@/config/api';
import { IProduct } from "@/types/backend";
import { formatPrice } from "@/utils/format";
import { useNavigate } from 'react-router-dom';
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import DataTable from "@/components/client/data.table";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { paginationConfigure } from '@/utils/paginator';
import { convertCSV, handleExportAsXlsx } from '@/utils/file';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductsByRestaurant } from "@/redux/slice/productSlide";

const ProductPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const tableRef = useRef<ActionType>();

    const meta = useAppSelector(state => state.product.meta);
    const products = useAppSelector(state => state.product.result);
    const isFetching = useAppSelector(state => state.product.isFetching);
    const [selectedUnits, setSelectedUnits] = useState<{ [key: number]: number }>({});

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const handleUnitClick = (productId: number | undefined, unitId: number | undefined) => {
        if (!productId || !unitId) return;

        setSelectedUnits(prev => ({
            ...prev,
            [productId]: unitId
        }));
    };

    const handleToggleActive = async (record: IProduct, checked: boolean) => {
        const updatedRecord = { ...record, active: checked };
        const res = await productApi.callUpdate(updatedRecord);

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

    const handleDeleteProduct = async (id: string | undefined) => {
        if (id) {
            const res = await productApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa món ăn thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const formatCSV = (data: IProduct[]) => {
        const excludeKeys = [
            'id', 'active', 'createdBy', 'createdDate',
            'lastModifiedDate', 'lastModifiedBy', 'restaurant'
        ];
        return data.map((row) => {
            return (Object.keys(row) as Array<keyof IProduct>)
                .filter((key) => !excludeKeys.includes(key as string))
                .reduce((newRow, key) => {
                    newRow[key] = convertCSV(row[key]);
                    return newRow;
                }, {} as Record<keyof IProduct, any>)
        })
    }

    const columns: ProColumns<IProduct>[] = [
        {
            title: '#',
            key: 'index',
            width: 50,
            align: "center",
            hideInSearch: true,
            render: (_, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)}</>)
            },
        },
        {
            title: 'Tên hàng',
            dataIndex: 'name',
            sorter: true,
            width: 300,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            align: "center",
            hideInSearch: false,
            width: 150,
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'product.units',
            hideInSearch: true,
            width: 200,
            render(_, record) {
                const units = record?.units || [];
                return (
                    <Space size="small" wrap>
                        {units.map(unit => (
                            <Tag
                                key={unit.id}
                                color={selectedUnits[Number(record.id)] === unit.id ? 'blue' : (unit.isDefault ? 'red' : 'default')}
                                onClick={() => handleUnitClick(Number(record.id), unit.id)}
                                style={{ cursor: "pointer" }}
                            >
                                {unit.name}
                            </Tag>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: 'Giá bán',
            align: "center",
            dataIndex: 'price',
            hideInSearch: true,
            width: 120,
            render(_, record) {
                const units = record?.units || [];
                const selectedUnit = units.find(c => c.id === selectedUnits[Number(record.id)]) || units.find(c => c.isDefault) || units[0];
                return <>{formatPrice(selectedUnit.price)} ₫</>
            },
        },
        // {
        //     title: 'Phân loại',
        //     dataIndex: 'type',
        //     align: "center",
        //     hideInSearch: true,
        // },
        // {
        //     title: 'Khu chế biến',
        //     dataIndex: 'station',
        //     align: "center",
        //     hideInSearch: true,
        // },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            hideInSearch: true,
            width: 90,
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
            width: 80,
            align: "center",
            render: (value, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.PRODUCTS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                navigate(`/admin/product/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access >

                    <Access permission={ALL_PERMISSIONS.PRODUCTS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa hàng hóa"}
                            description={"Bạn có chắc chắn muốn xóa hàng hóa này ?"}
                            onConfirm={() => handleDeleteProduct(entity.id)}
                            okText="Xác nhận"
                            cancelText="Đóng"
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

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=active,desc&sort=createdDate,asc`;
        } else {
            temp = `${temp}&sort=active,desc&${sortBy}`;
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.PRODUCTS.GET_PAGINATE}>
            <DataTable<IProduct>
                rowKey="id"
                columns={columns}
                actionRef={tableRef}
                loading={isFetching}
                dataSource={products}
                headerTitle="Danh sách món ăn"
                pagination={paginationConfigure(meta)}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchProductsByRestaurant({ query }))
                }}
                toolBarRender={(): any => [
                    <Button onClick={handleExportAsXlsx(products, formatCSV)}>
                        <DownloadOutlined /> Export
                    </Button>,

                    <Access permission={ALL_PERMISSIONS.PRODUCTS.CREATE}>
                        <Button type="primary" onClick={() => navigate('upsert')}>
                            <PlusOutlined /> Thêm mới
                        </Button>
                    </Access>,
                ]}
            />
        </Access>
    )
}

export default ProductPage;