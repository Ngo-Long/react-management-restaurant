import dayjs from 'dayjs';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IProduct } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";
import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";

import { productApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductByRestaurant } from "@/redux/slice/productSlide";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';

const ProductPage = () => {
    const tableRef = useRef<ActionType>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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

    const columns: ProColumns<IProduct>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (_, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)}</>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên hàng',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            sorter: true,
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
            render(_, record) {
                const units = record?.units || [];
                const selectedUnit = units.find(c => c.id === selectedUnits[Number(record.id)]) || units.find(c => c.isDefault) || units[0];
                const price = selectedUnit?.price || 0;
                return <>{price.toLocaleString()} ₫</>;
            },
        },
        {
            title: 'Phân loại',
            dataIndex: 'type',
            sorter: true,
            align: "center",
        },
        {
            title: 'Hoạt động',
            align: "center",
            dataIndex: 'active',
            hideInSearch: false,
            renderFormItem: (item, props, form) => (
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
            render(_, record) {
                return <>
                    <Tag color={record.active ? "lime" : "red"} >
                        {record.active ? "ACTIVE" : "INACTIVE"}
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
                    < Access permission={ALL_PERMISSIONS.PRODUCTS.UPDATE} hideChildren>
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
            <Access permission={ALL_PERMISSIONS.PRODUCTS.GET_PAGINATE}>
                <DataTable<IProduct>
                    actionRef={tableRef}
                    headerTitle="Danh sách món ăn"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={products}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchProductByRestaurant({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} hàng</div>) }
                    }}
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => navigate('upsert')}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
        </div >
    )
}

export default ProductPage;