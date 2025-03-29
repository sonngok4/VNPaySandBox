
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './PaymentResult.css';

// URL server API
const API_URL = 'http://localhost:3000/api';

function PaymentResult() {
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy query parameters từ URL
                const queryParams = new URLSearchParams(location.search);

                // Kiểm tra nếu có các tham số cần thiết
                if (queryParams.has('vnp_ResponseCode')) {
                    // Gọi API để xác minh giao dịch
                    const response = await axios.get(`${API_URL}/payment/vnpay_return${location.search}`);
                    setPaymentInfo(response.data);
                } else {
                    setError('Không có thông tin thanh toán');
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
                setError('Có lỗi xảy ra khi xác minh thanh toán');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location]);

    // Hiển thị thông tin chi tiết giao dịch
    const renderTransactionDetails = () => {
        if (!paymentInfo || !paymentInfo.data) return null;

        const { data } = paymentInfo;
        const isSuccess = paymentInfo.code === '00';

        return (
            <div className="transaction-details">
                <h3>Chi tiết giao dịch</h3>

                <table>
                    <tbody>
                        <tr>
                            <td>Mã đơn hàng:</td>
                            <td>{data.vnp_TxnRef}</td>
                        </tr>
                        <tr>
                            <td>Số tiền:</td>
                            <td>{parseInt(data.vnp_Amount) / 100} VNĐ</td>
                        </tr>
                        <tr>
                            <td>Nội dung thanh toán:</td>
                            <td>{data.vnp_OrderInfo}</td>
                        </tr>
                        <tr>
                            <td>Mã giao dịch VNPay:</td>
                            <td>{data.vnp_TransactionNo}</td>
                        </tr>
                        <tr>
                            <td>Thời gian thanh toán:</td>
                            <td>{formatDateTime(data.vnp_PayDate)}</td>
                        </tr>
                        <tr>
                            <td>Ngân hàng:</td>
                            <td>{data.vnp_BankCode}</td>
                        </tr>
                        <tr>
                            <td>Trạng thái:</td>
                            <td className={isSuccess ? 'status-success' : 'status-failed'}>
                                {isSuccess ? 'Thành công' : 'Thất bại'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    // Hàm format ngày giờ từ định dạng yyyyMMddHHmmss
    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';

        const year = dateTimeStr.substring(0, 4);
        const month = dateTimeStr.substring(4, 6);
        const day = dateTimeStr.substring(6, 8);
        const hour = dateTimeStr.substring(8, 10);
        const minute = dateTimeStr.substring(10, 12);
        const second = dateTimeStr.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    if (loading) {
        return (
            <div className="payment-result loading">
                <div className="loader"></div>
                <p>Đang xử lý kết quả thanh toán...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-result error">
                <div className="result-icon">❌</div>
                <h2>Có lỗi xảy ra</h2>
                <p>{error}</p>
                <Link to="/" className="back-button">Quay lại trang thanh toán</Link>
            </div>
        );
    }

    const isSuccess = paymentInfo && paymentInfo.code === '00';

    return (
        <div className={`payment-result ${isSuccess ? 'success' : 'failed'}`}>
            <div className="result-icon">
                {isSuccess ? '✅' : '❌'}
            </div>

            <h2>{isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h2>

            <p className="result-message">
                {isSuccess
                    ? 'Giao dịch của bạn đã được xử lý thành công.'
                    : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.'}
            </p>

            {renderTransactionDetails()}

            <div className="action-buttons">
                <Link to="/" className="back-button">
                    Quay lại trang thanh toán
                </Link>
            </div>
        </div>
    );
}

export default PaymentResult;