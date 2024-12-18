import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import queryString from 'query-string';
import { IProduct } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";

import Access from "@/components/share/access";
import DataTable from "@/components/client/data-table";
import ModalProduct from '@/components/admin/product/modal.product';

import { productApi } from "@/config/api";
import { ALL_PERMISSIONS } from "@/config/permissions";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProduct, fetchProductByRestaurant } from "@/redux/slice/productSlide";

import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';


const ProductPage = () => {
    const tableRef = useRef<ActionType>();

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IProduct | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const products = useAppSelector(state => state.product.result);

    const meta = useAppSelector(state => state.product.meta);
    const isFetching = useAppSelector(state => state.product.isFetching);

    const currentUser = useAppSelector(state => state.account.user);
    const isRoleOwner: boolean = Number(currentUser?.role?.id) === 1;

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

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
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên hàng',
            width: '250px',
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
            title: 'Giá bán',
            align: "center",
            dataIndex: 'sellingPrice',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.sellingPrice;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Giá vốn',
            align: "center",
            dataIndex: 'costPrice',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.costPrice;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'Tồn kho',
            align: "center",
            dataIndex: 'quantity',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.quantity;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            width: 180,
            sorter: true,
            align: "center",
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('HH:mm:ss DD-MM-YYYY') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày sửa',
            dataIndex: 'lastModifiedDate',
            width: 150,
            sorter: true,
            hidden: true,
            align: "center",
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
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access permission={ALL_PERMISSIONS.PRODUCTS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
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
                    headerTitle="Danh sách hàng hóa"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={products}
                    request={
                        async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            (isRoleOwner
                                ? dispatch(fetchProduct({ query }))
                                : dispatch(fetchProductByRestaurant({ query })))
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

            <ModalProduct
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default ProductPage;