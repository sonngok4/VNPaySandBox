import React, { useState } from 'react';
import axios from 'axios';
import './Payment.css';

const Payment = ({ totalAmount, orderId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentOption, setPaymentOption] = useState('cod');

    // Hàm xử lý khi người dùng chọn thanh toán qua Momo
    const handleMomoPayment = async () => {
        try {
            setIsLoading(true);

            // Gọi API của backend để tạo payment URL
            const response = await axios.post('/api/create-momo-payment', {
                amount: totalAmount,
                orderId: orderId,
                orderInfo: `Thanh toán đơn hàng #${orderId}`,
            });

            // Nhận payment URL từ backend và chuyển hướng
            if (response.data && response.data.payUrl) {
                window.location.href = response.data.payUrl;
            } else {
                alert('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error creating Momo payment:', error);
            alert('Có lỗi xảy ra khi tạo thanh toán Momo. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý khi người dùng chọn thanh toán COD
    const handleCODPayment = () => {
        // Xử lý logic thanh toán COD
        alert('Đơn hàng của bạn sẽ được giao hàng và thu tiền tại nhà.');
        // Chuyển hướng đến trang xác nhận đơn hàng
        // window.location.href = '/order-confirmation';
    };

    // Hàm xử lý thanh toán
    const handlePayment = () => {
        if (paymentOption === 'momo') {
            handleMomoPayment();
        } else if (paymentOption === 'cod') {
            handleCODPayment();
        }
    };

    return (
        <div className="payment-container">
            <h2>Chọn phương thức thanh toán</h2>

            <div className="payment-options">
                <div className="payment-option">
                    <input
                        type="radio"
                        id="cod"
                        name="payment"
                        value="cod"
                        checked={paymentOption === 'cod'}
                        onChange={() => setPaymentOption('cod')}
                    />
                    <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                </div>

                <div className="payment-option">
                    <input
                        type="radio"
                        id="momo"
                        name="payment"
                        value="momo"
                        checked={paymentOption === 'momo'}
                        onChange={() => setPaymentOption('momo')}
                    />
                    <label htmlFor="momo">Thanh toán qua ví MoMo</label>
                </div>

                {/* Có thể thêm các phương thức thanh toán khác ở đây */}
            </div>

            <div className="order-summary">
                <h3>Thông tin đơn hàng</h3>
                <p>Mã đơn hàng: #{orderId}</p>
                <p>Tổng thanh toán: {totalAmount.toLocaleString()} VNĐ</p>
            </div>

            <button
                className="payment-button"
                onClick={handlePayment}
                disabled={isLoading}
            >
                {isLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>
        </div>
    );
};

export default Payment;