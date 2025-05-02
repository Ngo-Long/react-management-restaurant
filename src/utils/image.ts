// utils/imageHelper.ts
import { message } from "antd";
import { v4 as uuidv4 } from 'uuid';
import { callUploadSingleFile } from "@/config/api";

// Hàm để chuyển ảnh thành base64
export const getBase64 = (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

// Hàm kiểm tra file ảnh trước khi upload
export const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('Chỉ tải ảnh dạng JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Ảnh không được quá 2MB!');
    }
    return isJpgOrPng && isLt2M;
};

// Hàm xử lý thay đổi trạng thái upload
export const handleChange = (info: any, setLoadingUpload: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (info.file.status === 'uploading') {
        setLoadingUpload(true);
        return;
    }
    
    if (info.file.status === 'done' || info.file.status === 'error' || info.file.status === 'removed') {
        setLoadingUpload(false);
    }
    
    if (info.file.status === 'error') {
        message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi tải ảnh!");
    }
};

// Hàm upload file logo
export const handleUploadFileLogo = async ({ file, onSuccess, onError }: any, setDataLogo: React.Dispatch<React.SetStateAction<any[]>>, urlTarget: string) => {
    try {
        const res = await callUploadSingleFile(file, urlTarget);
        if (res && res.data) {
            setDataLogo([{
                name: res.data.fileName,
                uid: uuidv4()
            }]);
            onSuccess?.('ok'); 
        } else {
            throw new Error(res.message || "Upload failed");
        }
    } catch (error) {
        setDataLogo([]);
        onError?.({ event: error });
    }
};

// Hàm xử lý xóa file logo
export const handleRemoveFile = (setDataLogo: React.Dispatch<React.SetStateAction<any[]>>) => {
    setDataLogo([]);
};
