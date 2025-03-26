
import {
    ModalForm,
    ProFormText,
    ProFormTextArea,
    ProFormTimePicker,
} from "@ant-design/pro-components";
import {
    Col, Form, Row,
    message, notification
} from "antd";
import 'react-quill/dist/quill.snow.css';
import dayjs from "dayjs";
import { shiftApi } from "@/config/api";
import { isMobile } from 'react-device-detect';
import { IFeedback } from "@/types/backend";
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from "@/redux/hooks";

declare type IProps = {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IFeedback | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export const ModalShift = (props: IProps) => {
    const [form] = Form.useForm();
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const currentRestaurant = useAppSelector(state => state.account.user?.restaurant);

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

    const submitShift = async (valuesForm: any) => {
        const { name, inTime, outTime, description } = valuesForm;

        const shift = {
            id: dataInit?.id,
            name,
            inTime: inTime ? dayjs(inTime, "HH:mm").format("YYYY-MM-DDTHH:mm:ss[Z]") : '',
            outTime: outTime ? dayjs(outTime, "HH:mm").format("YYYY-MM-DDTHH:mm:ss[Z]") : '',
            description,
            active: true,
            restaurant: {
                id: currentRestaurant?.id
            }
        };

        const res = dataInit?.id
            ? await shiftApi.callUpdate(shift)
            : await shiftApi.callCreate(shift);

        if (res.data) {
            message.success(`${dataInit?.id ? 'Cập nhật' : 'Tạo mới'} ca làm thành công`);
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
                onFinish={submitShift}
                initialValues={{ ...dataInit }}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24} md={12}>
                        <ProFormText
                            name="name"
                            label="Tên ca làm"
                            placeholder="Nhập tên ca làm"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={12} md={6}>
                        <ProFormTimePicker
                            name="inTime"
                            label="Giờ vào"
                            placeholder="Chọn giờ vào"
                            fieldProps={{ format: "HH:mm" }}
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={12} md={6}>
                        <ProFormTimePicker
                            name="outTime"
                            label="Giờ ra"
                            placeholder="Chọn giờ ra"
                            fieldProps={{ format: "HH:mm" }}
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24}>
                        <ProFormTextArea
                            name="description"
                            label="Mô tả"
                            placeholder="Nhập mô tả"
                        />
                    </Col>
                </Row>
            </ModalForm >
        </>
    )
}
