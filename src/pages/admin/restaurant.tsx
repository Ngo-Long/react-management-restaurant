import {
    Tag,
    Space,
    Button,
    message,
    Popconfirm,
    notification
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    ActionType,
    ProColumns,
    ProFormSelect
} from '@ant-design/pro-components';

import dayjs from 'dayjs';
import queryString from 'query-string';
import { useState, useRef } from 'react';
import { restaurantApi } from "@/config/api";
import { IRestaurant } from "@/types/backend";
import Access from "@/components/share/access";
import { sfLike } from "spring-filter-query-builder";
import { ALL_PERMISSIONS } from "@/config/permissions";
import DataTable from "@/components/client/data.table";
import { paginationConfigure } from "@/utils/paginator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchRestaurant } from "@/redux/slice/restaurantSlide";
import ModalRestaurant from "@/components/admin/restaurant/modal.restaurant";

const RestaurantPage = () => {
    const tableRef = useRef<ActionType>();
    const dispatch = useAppDispatch();
    const meta = useAppSelector(state => state.restaurant.meta);
    const restaurants = useAppSelector(state => state.restaurant.result);
    const isFetching = useAppSelector(state => state.restaurant.isFetching);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IRestaurant | null>(null);

    const handleDeleteRestaurant = async (id: string | undefined) => {
        if (!id) {
            message.warning('Nhà hàng không hợp lệ!');
            return;
        }

        try {
            const res = await restaurantApi.callDelete(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa nhà hàng thành công');
                reloadTable();
            } else {
                notification.error({ message: 'Có lỗi xảy ra!' });
            }
        } catch (error) {
            notification.error({ message: 'Có lỗi xảy ra!' });
        }
    }

    const reloadTable = () => tableRef?.current?.reload();

    const columns: ProColumns<IRestaurant>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            hideInSearch: true,
            render: (text, record, index) => {
                return (<> {(index + 1) + (meta.page - 1) * (meta.pageSize)} </>)
            },
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Địa  chỉ',
            dataIndex: 'address',
            hideInSearch: true,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            hideInSearch: true,
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
            render(dom, entity) {
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
            width: 200,
            sorter: true,
            align: 'center',
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <>
                        {record.createdDate ? dayjs(record.createdDate).format('DD-MM-YYYY HH:mm:ss') : ""}
                    </>
                )
            },
        },
        // {
        //     title: 'Ngày sửa',
        //     dataIndex: 'lastModifiedDate',
        //     width: 200,
        //     sorter: true,
        //     align: 'center',
        //     hideInSearch: true,
        //     render: (text, record, index, action) => {
        //         return (
        //             <>
        //                 {record.lastModifiedDate ? dayjs(record.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}
        //             </>
        //         )
        //     },
        // },
        {
            title: 'Tác vụ',
            width: 100,
            align: 'center',
            hideInSearch: true,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.RESTAURANTS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >
                    <Access permission={ALL_PERMISSIONS.RESTAURANTS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa nhà hàng"}
                            description={"Bạn có chắc chắn muốn xóa nhà hàng này?"}
                            onConfirm={() => handleDeleteRestaurant(entity.id)}
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
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.address) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("address", clone.address)}`
                : `${sfLike("address", clone.address)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.address) {
            sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
        }
        if (sort && sort.createdDate) {
            sortBy = sort.createdDate === 'ascend' ? "sort=createdDate,asc" : "sort=createdDate,desc";
        }
        if (sort && sort.lastModifiedDate) {
            sortBy = sort.lastModifiedDate === 'ascend' ? "sort=lastModifiedDate,asc" : "sort=lastModifiedDate,desc";
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
        <Access
            permission={ALL_PERMISSIONS.RESTAURANTS.GET_PAGINATE}
        >
            <DataTable<IRestaurant>
                rowKey="RestaurantId"
                headerTitle="Danh sách nhà hàng"
                columns={columns}
                actionRef={tableRef}
                loading={isFetching}
                dataSource={restaurants}
                pagination={paginationConfigure(meta)}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchRestaurant({ query }))
                }}
                toolBarRender={(_action, _rows): any => [
                    <Access permission={ALL_PERMISSIONS.RESTAURANTS.CREATE} hideChildren>
                        <Button type="primary" onClick={() => setOpenModal(true)}>
                            <PlusOutlined />  Thêm mới
                        </Button>
                    </Access>
                ]}
            />

            <ModalRestaurant
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </Access>
    )
}

export default RestaurantPage;