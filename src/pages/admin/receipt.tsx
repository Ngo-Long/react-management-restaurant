import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import Access from "@/components/share/access";
import { ingredientApi } from "@/config/api";
import { IIngredient } from "@/types/backend";
import { sfIn } from "spring-filter-query-builder";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import ModalIngredient from '@/components/admin/receipt/modal.receipt';
import { fetchIngredientByRestaurant } from "@/redux/slice/ingredientSlide";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';

const ReceiptPage = () => {
    const tableRef = useRef<ActionType>();

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IIngredient | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const ingredients = useAppSelector(state => state.ingredient.result);

    const meta = useAppSelector(state => state.ingredient.meta);
    const isFetching = useAppSelector(state => state.ingredient.isFetching);

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

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
            title: 'Đơn vị',
            dataIndex: 'unit',
            sorter: true,
            align: "center",
        },
        {
            title: 'Phân loại',
            dataIndex: 'category',
            sorter: true,
            align: "center",
        },
        {
            title: 'Giá vốn',
            align: "center",
            dataIndex: 'price',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.price;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ₫</>
            },
        },
        {
            title: 'SL hiện tại',
            align: "center",
            dataIndex: 'initialQuantity',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.initialQuantity;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
            },
        },
        {
            title: 'SL tối thiểu',
            align: "center",
            dataIndex: 'minimumQuantity',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.minimumQuantity;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>
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
            render(dom, entity, index, action, schema) {
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

            <ModalIngredient
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default ReceiptPage;