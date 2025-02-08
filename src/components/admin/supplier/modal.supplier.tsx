
import 'react-quill/dist/quill.snow.css';
import { isMobile } from 'react-device-detect';
import { ISupplier } from "@/types/backend";
import { supplierApi } from "@/config/api";
import { useAppSelector } from "@/redux/hooks";
import { useState, useEffect, useCallback } from 'react';
import { Col, Form, Row, message, notification } from "antd";
import { ProFormSwitch, ProFormText, ModalForm } from "@ant-design/pro-components";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ISupplier | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalSupplier = (props: IProps) => {
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
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật nhà cung cấp" : "Tạo mới nhà cung cấp"}</>}
                open={openModal}
                modalProps={{
                    onCancel: resetModal,
                    afterClose: resetModal,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitSupplier}
                initialValues={dataInit?.id ? { ...dataInit } : {}}
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
                            label="Số email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập email"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            label="Số địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập địa chỉ"
                        />
                    </Col>

                    <Col span={24} md={24}>
                        <ProFormSwitch
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
        </>
    )
}

export default ModalSupplier;