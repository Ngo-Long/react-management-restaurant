import {
    Col,
    Row,
    Form,
    message,
    notification
} from "antd";
import {
    ProCard,
    DrawerForm,
    ProFormText,
    FooterToolbar,
    ProFormSwitch,
    ProFormTextArea
} from "@ant-design/pro-components";
import ModuleApi from "./module.api";
import { roleApi } from "@/config/api";
import { isMobile } from 'react-device-detect';
import { useAppDispatch } from "@/redux/hooks";
import { IPermission, IRole } from "@/types/backend";
import { CheckSquareOutlined } from "@ant-design/icons";
import { useState } from "react";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    listPermissions: {
        module: string;
        permissions: IPermission[]
    }[];
    singleRole: IRole | null;
    setSingleRole: (v: any) => void;
}

const ModalRole = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, listPermissions, singleRole, setSingleRole } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [animation, setAnimation] = useState<string>('open');

    const submitRole = async (valuesForm: any) => {
        const { description, active, name, permissions } = valuesForm;
        const checkedPermissions = [];

        if (permissions) {
            for (const key in permissions) {
                if (key.match(/^[1-9][0-9]*$/) && permissions[key] === true) {
                    checkedPermissions.push({ id: key });
                }
            }
        }

        if (singleRole?.id) {
            //update
            const role = {
                name, description, active, permissions: checkedPermissions
            }
            const res = await roleApi.callUpdate(role, singleRole.id);
            if (res.data) {
                message.success("Cập nhật chức vụ thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra!',
                    description: res.message
                });
            }
        } else {
            //create
            const role = {
                name, description, active, permissions: checkedPermissions
            }
            const res = await roleApi.callCreate(role);
            if (res.data) {
                message.success("Thêm mới chức vụ thành công");
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
        setOpenModal(false);
        setSingleRole(null);
    }

    return (
        <DrawerForm
            form={form}
            open={openModal}
            preserve={false}
            onFinish={submitRole}
            scrollToFirstError={true}
            title={<>{singleRole?.id ? "Cập nhật chức vụ" : "Tạo mới chức vụ"}</>}
            drawerProps={{
                keyboard: false,
                maskClosable: false,
                destroyOnClose: true,
                onClose: handleReset,
                afterOpenChange: (visible) => {
                    if (!visible) handleReset();
                },
                width: isMobile ? "100%" : 900,
                className: `modal-ingredient ${animation}`,
                rootClassName: `modal-ingredient-root ${animation}`
            }}
            submitter={{
                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                submitButtonProps: {
                    icon: <CheckSquareOutlined />
                },
                searchConfig: {
                    resetText: "Đóng",
                    submitText: <>{singleRole?.id ? "Cập nhật" : "Tạo mới"}</>,
                }
            }}
        >
            <Row gutter={16}>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText
                        label="Tên chức vụ"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng không bỏ trống' },
                        ]}
                        placeholder="Nhập tên"
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormSwitch
                        label="Trạng thái"
                        name="active"
                        checkedChildren="ACTIVE"
                        unCheckedChildren="INACTIVE"
                        initialValue={true}
                        fieldProps={{
                            defaultChecked: true,
                        }}
                    />
                </Col>

                <Col span={24}>
                    <ProFormTextArea
                        label="Miêu tả"
                        name="description"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        placeholder="Nhập miêu tả role"
                        fieldProps={{
                            autoSize: { minRows: 2 }
                        }}
                    />
                </Col>
                <Col span={24}>
                    <ProCard
                        title="Quyền hạn"
                        subTitle="Các quyền hạn được phép cho vai trò này"
                        headStyle={{ color: '#d81921' }}
                        style={{ marginBottom: 20 }}
                        headerBordered
                        size="small"
                        bordered
                    >
                        <ModuleApi
                            form={form}
                            listPermissions={listPermissions}
                            singleRole={singleRole}
                            openModal={openModal}
                        />

                    </ProCard>

                </Col>
            </Row>
        </DrawerForm>
    )
}

export default ModalRole;
