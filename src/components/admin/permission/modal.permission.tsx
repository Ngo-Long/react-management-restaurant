import { ModalForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect } from "react";
import { permissionApi } from '@/config/api';
import { IPermission } from "@/types/backend";
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
            //update
            const permission = {
                name,
                apiPath, method, module
            }

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
            //create
            const permission = {
                name,
                apiPath, method, module
            }
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
                title={<>{dataInit?.id ? "Cập nhật quyền hạn" : "Tạo mới quyền hạn"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
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
                onFinish={submitPermission}
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên quyền hạn"
                            name="name"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập tên quyền hạn"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Đường dẫn API"
                            name="apiPath"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập đường dẫn API"
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
                            label="Thuộc mô hình"
                            name="module"
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
