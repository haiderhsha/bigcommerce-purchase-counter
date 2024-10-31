const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Replace these with your BigCommerce API credentials
const clientId = 'hwpi9455ov7zwyyr0a4xdcurta4nsth';
const accessToken = 'r8c8e89l5eloi6orlevbzzljmox0ve6';
const storeHash = 'jr0zrv3wmv';

const baseUrl = `https://api.bigcommerce.com/stores/${storeHash}/v2`;
const headers = {
    'X-Auth-Client': clientId,
    'X-Auth-Token': accessToken,
    'Content-Type': 'application/json'
};

// Endpoint to count product purchases
app.get('/count-purchases/:productId', async (req, res) => {
    const productId = req.params.productId;
    let purchaseCount = 0;

    try {
        const orders = await getOrders();
        for (const order of orders) {
            const orderProducts = await getOrderProducts(order.id);
            orderProducts.forEach((item) => {
                if (item.product_id === parseInt(productId)) {
                    purchaseCount += item.quantity;
                }
            });
        }
        res.json({ count: purchaseCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function getOrders() {
    let orders = [];
    let page = 1;

    while (true) {
        const response = await axios.get(`${baseUrl}/orders`, {
            headers: headers,
            params: { page: page, limit: 50 }
        });
        if (response.data.length === 0) break;
        orders = orders.concat(response.data);
        page += 1;
    }
    return orders;
}

async function getOrderProducts(orderId) {
    const response = await axios.get(`${baseUrl}/orders/${orderId}/products`, { headers: headers });
    return response.data;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
