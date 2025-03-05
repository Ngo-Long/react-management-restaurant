import {
    Col,
    Row,
    Form,
    message,
    notification
} from "antd";
import {
    ModalForm,
    ProFormText,
    ProFormSelect
} from "@ant-design/pro-components";
import { useEffect } from "react";
import { permissionApi } from '@/config/api';
import { IPermission } from "@/types/backend";
import { isMobile } from 'react-device-detect';
import { ALL_MODULES } from "@/config/permissions";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPermission | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalPermission = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue(dataInit)
        }
    }, [dataInit])

    const submitPermission = async (valuesForm: any) => {
        const { name, apiPath, method, module } = valuesForm;
        if (dataInit?.id) {
            const permission = { name, apiPath, method, module }
            const res = await permissionApi.callUpdate(permission, dataInit.id);
            if (res.data) {
                message.success("Cập nhật quyền hạn thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.error
                });
            }
        } else {
            const permission = { name, apiPath, method, module }
            const res = await permissionApi.callCreate(permission);
            if (res.data) {
                message.success("Thêm mới quyền hạn thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                form={form}
                open={openModal}
                preserve={false}
                scrollToFirstError={true}
                onFinish={submitPermission}
                initialValues={dataInit?.id ? dataInit : {}}
                title={<>{dataInit?.id ? "Cập nhật quyền hạn" : "Tạo mới quyền hạn"}</>}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 700,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            name="name"
                            label="Tên quyền hạn"
                            placeholder="Nhập tên quyền hạn"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            name="apiPath"
                            label="Đường dẫn API"
                            placeholder="Nhập đường dẫn API"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            label="Phương thức gọi"
                            name="method"
                            valueEnum={{
                                GET: 'GET',
                                POST: 'POST',
                                PUT: 'PUT',
                                PATCH: 'PATCH',
                                DELETE: 'DELETE',
                            }}
                            placeholder="Nhập phương thức gọi"
                            rules={[{ required: true, message: 'Vui lòng chọn phương thức gọi!' }]}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="module"
                            label="Thuộc mô hình"
                            valueEnum={ALL_MODULES}
                            placeholder="Vui lòng chọn module"
                            rules={[{ required: true, message: 'Vui lòng chọn module!' }]}
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalPermission;
