import { IUser } from "@/types/backend";
import { Badge, Descriptions, Drawer } from "antd";
import dayjs from 'dayjs';

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IUser | null;
    setDataInit: (v: any) => void;
}
const ViewDetailUser = (props: IProps) => {
    const { onClose, open, dataInit, setDataInit } = props;

    return (
        <>
            <Drawer
                title="Thông Tin người dùng"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"40vw"}
                maskClosable={false}
            >
                <Descriptions title="" bordered column={2} layout="vertical">
                    <Descriptions.Item label="Tên hiển thị">{dataInit?.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>

                    <Descriptions.Item label="Giới Tính">{dataInit?.gender}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{dataInit?.birthDate}</Descriptions.Item>

                    <Descriptions.Item label="Vai trò" >
                        {/* <Badge status="processing" text={<>{dataInit?.role}</>} /> */}
                        <Badge status="processing" text={dataInit?.role?.name || 'Không xác định'} />
                    </Descriptions.Item>

                    <Descriptions.Item label="Mô tả" >{dataInit?.description}</Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdDate ? dayjs(dataInit.createdDate).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.lastModifiedDate ? dayjs(dataInit.lastModifiedDate).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailUser;