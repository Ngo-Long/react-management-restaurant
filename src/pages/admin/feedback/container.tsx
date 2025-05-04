
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import {
    Col, Form, Row,
    message, notification
} from "antd";
import 'react-quill/dist/quill.snow.css';
import { feedbackApi } from "@/config/api";
import { isMobile } from 'react-device-detect';
import { IFeedback } from "@/types/backend";
import { useEffect, useRef, useState } from 'react';

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IFeedback | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export const ModalFeedback = (props: IProps) => {
    const [form] = Form.useForm();
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({ dataInit })
        }
    }, [dataInit])

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    const submitFeedback = async (valuesForm: any) => {
        const { subject, content } = valuesForm;

        const feedback = {
            id: dataInit?.id,
            content,
            subject,
        };

        const res = dataInit?.id
            ? await feedbackApi.callUpdate(feedback)
            : await feedbackApi.callCreate(feedback);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} đánh giá thành côngs`);
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
                    cancelText: "Đóng"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitFeedback}
                initialValues={{
                    ...dataInit
                }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            name="subject"
                            label="Tên tiêu đề"
                            placeholder="Nhập tiêu đề"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <ProFormText
                            name="content"
                            label="Nội Dung "
                            placeholder="Nhập nội dung"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>
                </Row>
            </ModalForm >
        </>
    )
}
