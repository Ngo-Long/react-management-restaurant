import { orderDetailApi } from "@/config/api";
import { IOrderDetail } from "@/types/backend";
import {
    PlusOutlined,
    MinusOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Col, Flex, InputNumber, message, Modal, Row, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

declare type IProps = {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    currentData: IOrderDetail | null;
    setCurrentData: (order: IOrderDetail | null) => void;
}
  
export const ModalReasonCancel = ({
    isModalOpen, 
    setIsModalOpen,
    currentData,
    setCurrentData,
}: IProps) => {
    const [note, setNote] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1); 
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    
    const handleQuantityChange = (value: number | null) => {
        if (value === null) return;
        const newQuantity = Math.max(1, Math.min(currentData?.quantity || 1, value));
        setQuantity(newQuantity);
    };

    const handleReasonCancel = async () => {
        if (!currentData || selectedReasons.length === 0) {
            message.warning('Vui lòng chọn lí do.');
            return;
        }
    
        console.log(selectedReasons);
        console.log({
            ...currentData,
            status: 'CANCELED',
            quantity: quantity,
            note: `${note}, ${selectedReasons.join(', ')}`
        });

        try {
            if (currentData.quantity === quantity) {
                // Trường hợp hủy toàn bộ: cập nhật trạng thái CANCELED
                const updateData = {
                    ...currentData,
                    status: 'CANCELED',
                    quantity: currentData.quantity,
                    note: `${note}, ${selectedReasons.join(', ')}`
                };
                await orderDetailApi.callUpdate(updateData);
            } else {
                // Trường hợp hủy một phần:
                const newCanceledItem = {
                    ...currentData,
                    id: undefined,
                    status: 'CANCELED',
                    quantity: quantity,
                    note: `${note}, ${selectedReasons.join(', ')}`
                };
                
                const updateOriginalItem = {
                    ...currentData,
                    quantity: currentData.quantity! - quantity,
                };
                
                await Promise.all([
                    orderDetailApi.callCreate(newCanceledItem),
                    orderDetailApi.callUpdate(updateOriginalItem)
                ]);
            }
    
            // reset
            resetReason();
            message.success('Hủy món ăn thành công.')
        } catch (error) {
            console.error('Hủy món ăn thất bại: ', error);
            message.error('Hủy món ăn thất bại.');
        }
    };

    const resetReason = () => {
        setNote('');
        setQuantity(1);
        setCurrentData(null);
        setSelectedReasons([]);
        setIsModalOpen(false);
    }

    return (
        <Modal
            title={`Hủy món ăn - ${currentData?.product?.name}`}
            width={400}
            open={isModalOpen}
            className='container-modal'
            onCancel={resetReason}
            footer={[
                <Button onClick={() => setIsModalOpen(false)}>
                    Đóng
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    className="btn-green" 
                    onClick={handleReasonCancel}
                >
                    Xác nhận
              </Button>
            ]}
        >
            <Row style={{ margin: '16px 0' }} gutter={[0, 10]}>
                <Col span={24}>
                    <Flex align="center" gap="small">
                        <Typography.Text className='modal-card__title'>Số lượng:</Typography.Text>
                        <Button
                            size="middle" 
                            color="danger" 
                            variant="outlined"
                            disabled={quantity <= 1}
                            onClick={() => handleQuantityChange(quantity - 1)}
                            style={{ height: '30px', width: '30px' }}
                        >
                            <MinusOutlined style={{ width: 14 }} />
                        </Button>

                        <InputNumber
                            min={0}
                            max={currentData?.quantity}
                            size="middle"
                            controls={false}
                            style={{ width: '60px' }}
                            value={quantity}
                            onChange={handleQuantityChange}
                        />

                        <Typography.Text className='modal-card__title'>
                            / {currentData?.quantity}
                        </Typography.Text>

                        <Button
                            style={{ height: '30px', width: '30px' }}
                            size="middle" 
                            color="danger" 
                            variant="outlined"
                            disabled={quantity >= currentData?.quantity!}
                            onClick={() => handleQuantityChange(quantity + 1)}
                        >
                            <PlusOutlined style={{ width: 14 }} />
                        </Button>
                    </Flex>
                </Col>

                <Col span={24}>
                    <Typography.Text className='modal-card__title'>Chọn lý do:</Typography.Text>                
                    <Checkbox.Group 
                        style={{ width: '100%', marginTop: 6 }}
                        value={selectedReasons}
                        onChange={(checkedValues) => setSelectedReasons(checkedValues)}
                    >
                        <Flex vertical gap={8}>
                            <Checkbox value="Nhầm món">Nhầm món</Checkbox>
                            <Checkbox value="Hết nguyên liệu">Hết nguyên liệu</Checkbox>
                            <Checkbox value="Khách yêu cầu hủy">Khách yêu cầu hủy</Checkbox>
                            <Checkbox value="Thời gian chế biến lâu">Thời gian chế biến lâu</Checkbox>
                        </Flex>
                    </Checkbox.Group>
                </Col>
        
                <Col span={24}>
                    <Typography.Text className='modal-card__title'>Lí do khác:</Typography.Text>
                    <TextArea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{ marginTop: 6 }}
                        placeholder='Tối đa 100 kí tự'
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        maxLength={100}
                    />
                </Col>
            </Row>
        </Modal>
    )
}
