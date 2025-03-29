require('dotenv').config();
const express = require('express');
const cors = require('cors');
const moment = require('moment');
const querystring = require('querystring');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	}),
);

// Cấu hình VNPay
const vnp_TmnCode = process.env.VNP_TMN_CODE;
const vnp_HashSecret = process.env.VNP_HASH_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
const vnp_ApiUrl = process.env.VNP_API_URL;

// Tạo đối tượng order đơn giản để lưu trữ
const orders = {};

// API tạo URL thanh toán
app.post('/api/create-payment', function(req, res, next) {
	try {
		const ipAddr =
			req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		const { amount, orderDescription, orderType, language } = req.body;

		// Tạo mã đơn hàng
		const createDate = moment().format('YYYYMMDDHHmmss');
		const orderId = moment().format('HHmmss');

		// Lưu thông tin đơn hàng
		orders[orderId] = {
			amount,
			orderDescription,
			status: 'pending',
			createDate,
		};

		// Tạo tham số cho URL thanh toán
		let vnp_Params = {
			vnp_Version: '2.1.0',
			vnp_Command: 'pay',
			vnp_TmnCode: vnp_TmnCode,
			vnp_Locale: language || 'vn',
			vnp_CurrCode: 'VND',
			vnp_TxnRef: orderId,
			vnp_OrderInfo: orderDescription || 'Thanh toan don hang',
			vnp_OrderType: orderType || 'other',
			vnp_Amount: parseInt(amount) * 100,
			vnp_ReturnUrl: vnp_ReturnUrl,
			vnp_IpAddr: ipAddr,
			vnp_CreateDate: createDate,
		};

		// Sắp xếp các tham số theo alphabet
		vnp_Params = sortObject(vnp_Params);

		// Tạo chuỗi ký tự để mã hóa
		const signData = querystring.stringify(vnp_Params, { encode: false });

		// Tạo chữ ký
		const hmac = crypto.createHmac('sha512', vnp_HashSecret);
		const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

		// Thêm chữ ký vào tham số
		vnp_Params['vnp_SecureHash'] = signed;

		// Tạo URL hoàn chỉnh để redirect
		const paymentUrl =
			vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

		// Trả về URL thanh toán
		return res.status(200).json({
			code: '00',
			message: 'success',
			data: paymentUrl,
		});
	} catch (error) {
		console.error('Error creating payment URL:', error);
		return res.status(500).json({
			code: '99',
			message: 'Error creating payment URL',
			data: error.message,
		});
	}
});

// API xác nhận kết quả thanh toán
app.get('/api/payment/vnpay_return', function(req, res, next) {
	try {
		let vnp_Params = req.query;

		// Lấy chữ ký từ VNPay response
		const secureHash = vnp_Params['vnp_SecureHash'];

		// Xóa tham số chữ ký để tạo lại và kiểm tra
		delete vnp_Params['vnp_SecureHash'];
		delete vnp_Params['vnp_SecureHashType'];

		// Sắp xếp các tham số
		vnp_Params = sortObject(vnp_Params);

		// Tạo chuỗi ký tự để kiểm tra
		const signData = querystring.stringify(vnp_Params, { encode: false });

		// Tạo chữ ký từ dữ liệu để so sánh
		const hmac = crypto.createHmac('sha512', vnp_HashSecret);
		const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

		// Lấy thông tin đơn hàng
		const orderId = vnp_Params['vnp_TxnRef'];
		const amount = vnp_Params['vnp_Amount'] / 100; // Chuyển về đơn vị tiền tệ

		// Cập nhật trạng thái đơn hàng nếu có
		if (orders[orderId]) {
			orders[orderId].status =
				vnp_Params['vnp_ResponseCode'] === '00' ? 'success' : 'failed';
			orders[orderId].transactionData = vnp_Params;
		}

		// Kiểm tra chữ ký
		if (secureHash === signed) {
			// Kiểm tra mã phản hồi từ VNPay
			const responseCode = vnp_Params['vnp_ResponseCode'];

			return res.status(200).json({
				code: responseCode,
				message:
					responseCode === '00'
						? 'Thanh toán thành công'
						: 'Thanh toán thất bại',
				data: vnp_Params,
			});
		} else {
			return res.status(200).json({
				code: '97',
				message: 'Chữ ký không hợp lệ',
				data: {},
			});
		}
	} catch (error) {
		console.error('Error processing payment result:', error);
		return res.status(500).json({
			code: '99',
			message: 'Error processing payment result',
			data: error.message,
		});
	}
});

// API kiểm tra trạng thái đơn hàng
app.get('/api/order/:orderId', function(req, res, next) {
	const { orderId } = req.params;

	if (orders[orderId]) {
		return res.status(200).json({
			code: '00',
			message: 'success',
			data: orders[orderId],
		});
	} else {
		return res.status(404).json({
			code: '01',
			message: 'Order not found',
			data: {},
		});
	}
});

// Hàm sắp xếp object theo key
function sortObject(obj) {
	let sorted = {};
	const keys = Object.keys(obj).sort();

	for (const key of keys) {
		if (obj.hasOwnProperty(key)) {
			sorted[key] = obj[key];
		}
	}

	return sorted;
}

// Khởi động server
app.listen(PORT, () => {
	console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
