
import 'react-quill/dist/quill.snow.css';
import { supplierApi } from "@/config/api";
import { ISupplier } from "@/types/backend";
import { isMobile } from 'react-device-detect';
import { useAppSelector } from "@/redux/hooks";
import { handleImportXlsx } from '@/utils/file';
import { useEffect, useCallback, useState } from 'react';
import { Col, Form, Row, message, notification } from "antd";
import { ProFormSwitch, ProFormText, ModalForm, ProFormUploadDragger, ProTable } from "@ant-design/pro-components";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ISupplier | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export const ModalSupplier = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ ...dataInit })
        }
    }, [dataInit])

    const resetModal = useCallback(() => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }, [form, setDataInit, setOpenModal]);

    const submitSupplier = async (valuesForm: any) => {
        const {
            name, phone, email, address,
            debtAmount, totalAmount, active
        } = valuesForm;

        const supplier = {
            id: dataInit?.id,
            name,
            phone,
            email,
            address,
            debtAmount,
            totalAmount,
            active,
            restaurant: {
                id: currentRestaurant?.id,
                name: currentRestaurant?.name
            }
        };

        const res = dataInit?.id
            ? await supplierApi.callUpdate(supplier)
            : await supplierApi.callCreate(supplier);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} nhà cung cấp thành công`);
            resetModal();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    }

    return (
        <ModalForm
            form={form}
            open={openModal}
            preserve={false}
            scrollToFirstError={true}
            onFinish={submitSupplier}
            initialValues={dataInit?.id ? { ...dataInit } : {}}
            title={<>{dataInit?.id ? "Cập nhật nhà cung cấp" : "Tạo mới nhà cung cấp"}</>}
            modalProps={{
                onCancel: resetModal,
                afterClose: resetModal,
                destroyOnClose: true,
                width: isMobile ? "100%" : 700,
                keyboard: false,
                maskClosable: false,
                okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                cancelText: "Hủy"
            }}
        >
            <Row gutter={[30, 4]}>
                <Col span={24} md={12}>
                    <ProFormText
                        label="Tên nhà cung cấp"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập nhà cung cấp"
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập số điện thoại"
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập email"
                    />
                </Col>

                <Col span={24} md={12}>
                    <ProFormText
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập địa chỉ"
                    />
                </Col>

                <Col span={24} md={24}>
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
            </Row>
        </ModalForm >
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
    const [dataImported, setDataImported] = useState<ISupplier[]>([]);

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
        <ModalForm<ISupplier>
            title="Thêm nhà cung cấp"
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
                name="Nhập nhà cung cấp"
                title="Kéo & thả"
                label="Tải file (Nếu trùng tên nhà cung cấp thì không nhập)"
                tooltip={`Nếu trùng tên nhà cung cấp thì không nhập`}
                description="Chỉ hỗ trợ file .xlsx, tải lên tối đa 1 file"
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

            <ProTable<ISupplier>
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
                        title: 'Tên nhà cung cấp'
                    },
                    {
                        key: 'email',
                        dataIndex: 'email',
                        title: 'Email'
                    },
                    {
                        key: 'phone',
                        dataIndex: 'phone',
                        title: 'SĐT'
                    },
                    {
                        key: 'address',
                        dataIndex: 'address',
                        title: 'Địa chỉ'
                    }
                ]}
            />
        </ModalForm>
    );
};