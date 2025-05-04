import { 
    Col, 
    Row, 
    Form, 
    Space,
    message, 
    Dropdown, 
    notification, 
} from "antd";
import { 
    ModalForm, 
    ProFormText, 
    ProFormTextArea
} from "@ant-design/pro-components";
import { MenuOutlined } from '@ant-design/icons';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { authApi, feedbackApi } from "@/config/api";
import { Link, useNavigate } from "react-router-dom";
import { setLogoutAction } from "@/redux/slice/accountSlide";

const DropdownMenu = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.account.user);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);

    const handleLogout = async () => {
        const res = await authApi.callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const handleSubmitFeedback = async (valuesForm: any) => {
        const { subject, content } = valuesForm;

        const feedback = {
            id: undefined,
            content,
            subject,
            user: currentUser
        };

        const res = await feedbackApi.callCreate(feedback);
        if (res.data) {
            message.success(`Tạo mới đánh giá thành công`);
            handleReset();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setOpenFeedbackModal(false);
    }

    const itemsDropdown = [
        {
            label: <Link to={"/admin"}>Trang quản trị</Link>,
            key: "home",
        },
        {
            label: <Link to={"/sales"}>Bán hàng</Link>,
            key: "sales",
        },
        {
            label: <Link to={"/sales/kitchen"}>Bếp ăn</Link>,
            key: "kitchen",
        },
        {
            label: <Link to={"/sales/reception"}>Lễ tân</Link>,
            key: "reception",
        },
        {
            label: (
                <span onClick={() => setOpenFeedbackModal(true)}>
                    Đánh giá
                </span>
            ),
            key: "feedback",
        },
        {
            label: (
                <span onClick={handleLogout}>
                    Đăng xuất
                </span>
            ),
            key: "logout",
        },
    ];

    return (
        <>
            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                <Space style={{ cursor: "pointer" }}>
                    Menu <MenuOutlined />
                </Space>
            </Dropdown>
            
            <ModalForm
                title={"Tạo đánh giá"}
                open={openFeedbackModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: 500,
                    keyboard: false,
                    maskClosable: false,
                    okText: "Xác nhận",
                    cancelText: "Đóng"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={handleSubmitFeedback}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <ProFormText
                            name="subject"
                            label="Tên tiêu đề"
                            placeholder="Nhập tiêu đề"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col span={24}>
                        <ProFormTextArea
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

export default DropdownMenu;