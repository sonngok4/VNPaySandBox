import { useState } from 'react'
import axios from 'axios'
import './Checkout.css'

// URL server API
const API_URL = 'http://localhost:3000/api';

function Checkout() {
    const [formData, setFormData] = useState({
        amount: 10000,
        orderDescription: 'Thanh toán đơn hàng test',
        orderType: 'billpayment',
        language: 'vn'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'amount' ? parseInt(value) : value
        });
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/create-payment`, formData);

            if (response.data.code === '00') {
                // Chuyển hướng đến trang thanh toán VNPay
                window.location.href = response.data.data;
            } else {
                setError('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            setError('Có lỗi xảy ra khi tạo yêu cầu thanh toán. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Render các phương thức thanh toán
    const renderPaymentMethods = () => {
        return (
            <div className="payment-methods">
                <div className="payment-method-item">
                    <input
                        type="radio"
                        id="method-vnpay"
                        name="paymentMethod"
                        value="vnpay"
                        defaultChecked
                    />
                    <label htmlFor="method-vnpay">
                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" />
                        <span>Thanh toán qua VNPay</span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="checkout-container">
            <h1>Thanh toán đơn hàng</h1>

            <div className="checkout-content">
                <div className="order-summary">
                    <h2>Thông tin đơn hàng</h2>
                    <div className="order-items">
                        <div className="order-item">
                            <div className="item-name">Sản phẩm mẫu</div>
                            <div className="item-price">10.000 VNĐ</div>
                        </div>
                    </div>
                    <div className="order-total">
                        <div className="total-label">Tổng cộng:</div>
                        <div className="total-amount">{formData.amount.toLocaleString()} VNĐ</div>
                    </div>
                </div>

                <div className="payment-section">
                    <h2>Chọn phương thức thanh toán</h2>
                    {renderPaymentMethods()}

                    <form onSubmit={handleSubmit} className="payment-form">
                        <div className="form-group">
                            <label htmlFor="amount">Số tiền (VNĐ):</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                min="1000"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="orderDescription">Mô tả đơn hàng:</label>
                            <input
                                type="text"
                                id="orderDescription"
                                name="orderDescription"
                                value={formData.orderDescription}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="language">Ngôn ngữ:</label>
                            <select
                                id="language"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                            >
                                <option value="vn">Tiếng Việt</option>
                                <option value="en">Tiếng Anh</option>
                            </select>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="payment-button"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Checkout;