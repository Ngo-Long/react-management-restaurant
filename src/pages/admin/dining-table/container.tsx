
import {
    ModalForm,
    ProFormDigit,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
    ProFormUploadDragger,
    ProTable
} from "@ant-design/pro-components";
import {
    Button, Col, Divider, Form, Input, Row,
    Space, message, notification, InputRef
} from "antd";
import 'react-quill/dist/quill.snow.css';
import { diningTableApi } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { isMobile } from 'react-device-detect';
import { IDiningTable } from "@/types/backend";
import { handleImportXlsx } from "@/utils/file";
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IDiningTable | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export const ModalDiningTable = (props: IProps) => {
    const [form] = Form.useForm();
    const inputRef = useRef<InputRef>(null);
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [locations, setLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState<string>('');
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ dataInit })
        }
    }, [dataInit])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const diningTables = await diningTableApi.callFetchByRestaurant('');
                const uniqueLocations = [...new Set(diningTables.data?.result.map((table: IDiningTable) => table.location))];
                setLocations(uniqueLocations);
            } catch (error) {
                console.error("Lỗi khi fetch dữ liệu bàn ăn:", error);
            }
        };
        fetchData();
    }, []);

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    // add a new location
    const addLocation = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newLocation && !locations.includes(newLocation)) {
            setLocations([...locations, newLocation]);
            setNewLocation('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const submitDiningTable = async (valuesForm: any) => {
        const { name, location, seats, sequence, status, description, active } = valuesForm;

        const diningTable = {
            id: dataInit?.id,
            name,
            location,
            seats,
            sequence,
            status,
            description,
            active,
            restaurant: {
                id: currentRestaurant.id ?? '',
                name: currentRestaurant.name ?? ''
            }
        };

        const res = dataInit?.id
            ? await diningTableApi.callUpdate(diningTable)
            : await diningTableApi.callCreate(diningTable);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} bàn ăn thành công`);
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 600,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitDiningTable}
                initialValues={{
                    ...dataInit,
                    status: dataInit?.id ? dataInit.status : "AVAILABLE",
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            name="name"
                            label="Tên bàn ăn"
                            placeholder="Nhập bàn ăn"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            name="sequence"
                            label="Số thứ tự"
                            placeholder="Nhập số thứ tự"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormDigit
                            name="seats"
                            label="Số ghế"
                            placeholder="Nhập số ghế"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormSelect
                            label="Vị trí"
                            name="location"
                            placeholder="Chọn vị trí"
                            rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                            options={locations.map(location => ({ label: location, value: location }))}
                            fieldProps={{
                                dropdownRender: (menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <Input
                                                placeholder="Thêm vị trí mới"
                                                value={newLocation}
                                                onChange={(e) => setNewLocation(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                ref={inputRef}
                                            />
                                            <Button type="text" icon={<PlusOutlined />} onClick={addLocation}>
                                                Thêm
                                            </Button>
                                        </Space>
                                    </>
                                ),
                            }}
                        />
                    </Col>

                    {false && (
                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="status"
                                label="Trạng thái"
                                valueEnum={{
                                    OCCUPIED: 'Đã có khách',
                                    RESERVED: 'Đã đặt trước',
                                    AVAILABLE: 'Còn trống',
                                }}
                                placeholder="Vui lòng chọn trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            />
                        </Col>
                    )}
                </Row>
                <Col span={24}>
                    <ProFormTextArea
                        label="Mô tả"
                        name="description"
                        placeholder="Nhập mô tả"
                        rules={[{ required: false, message: '' }]}
                    />
                </Col>
                <Col span={24} md={12}>
                    <ProFormSwitch
                        hidden
                        noStyle
                        label="Hoạt động"
                        name="active"
                        checkedChildren="ACTIVE"
                        unCheckedChildren="INACTIVE"
                        initialValue={true}
                        fieldProps={{ defaultChecked: true }}
                    />
                </Col>
            </ModalForm >
        </>
    )
}

declare type IBatchImportBatchImport = {
    open: boolean;
    onOpen: (open: boolean) => void;
    loading?: boolean;
    onLoading?: (loading: boolean) => void;
    reloadTable: () => void;
    onSubmit: (values: any) => void;
}

export const ModalBatchImport = (props: IBatchImportBatchImport) => {
    const { open, onOpen, loading = false, onLoading, reloadTable, onSubmit } = props;
    const [dataImported, setDataImported] = useState<IDiningTable[]>([]);

    const onFinish = async (values: any) => {
        if (dataImported.length === 0) {
            message.error("Vui lòng chọn file");
            return;
        }

        onLoading && onLoading(true);
        onSubmit(dataImported);
        setDataImported([]);
    }

    return (
        <ModalForm<IDiningTable>
            title="Import bàn ăn"
            open={open}
            modalProps={{
                onCancel: () => onOpen(false),
                afterClose: () => onOpen(false),
                destroyOnClose: true,
                width: isMobile ? "100%" : 600,
                keyboard: false,
                maskClosable: false,
                okText: 'Xác nhận',
                cancelText: "Hủy"
            }}
            onFinish={onFinish}
        >
            <ProFormUploadDragger
                max={1}
                name="Upload bàn ăn"
                title="Kéo & thả"
                label="Tải file excel bàn ăn"
                tooltip={`Chỉ hỗ trợ file excel .xlsx`}
                description="Chỉ hỗ trợ file Excel .xlsx, tải lên tối đa 1 file"
                fieldProps={{
                    beforeUpload: async (file) => {
                        const isExcel =
                            file.type === 'application/vnd.ms-excel' ||
                            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        if (!isExcel) {
                            message.error("Chỉ hỗ trợ file excel .xlsx");
                            return;
                        }

                        try {
                            const data = await handleImportXlsx(file);
                            if (data.length > 100) {
                                message.error("File không được quá 100 dòng");
                                return false;
                            }

                            setDataImported(data);
                        } catch (error) {
                            message.error("Lỗi file");
                        }
                        return false;
                    },
                    onRemove: () => {
                        setDataImported([]);
                    }
                }}
            />

            <ProTable<IDiningTable>
                search={false}
                options={false}
                dataSource={dataImported}
                pagination={{
                    pageSize: 5,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trên tổng ${total}`
                }}
                locale={{
                    emptyText: (
                        <div style={{ textAlign: "center" }}>
                            <div>Không có dữ liệu</div>
                        </div>
                    )
                }}
                columns={[
                    {
                        key: 'name',
                        dataIndex: 'name',
                        title: 'Tên bàn ăn'
                    },
                    {
                        key: 'location',
                        dataIndex: 'location',
                        title: 'Vị trí'
                    },
                    {
                        key: 'seats',
                        dataIndex: 'seats',
                        title: 'Số chỗ ngồi'
                    },
                    {
                        key: 'sequence',
                        dataIndex: 'sequence',
                        title: 'Số thứ tự',
                    },
                    {
                        title: 'Mô tả',
                        key: 'description',
                        dataIndex: 'description',
                    }
                ]}
            />
        </ModalForm>
    );
};