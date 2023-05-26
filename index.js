const axios = require('axios');


const SHOPIFY_TOKEN = "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"
const PIPEDRIVE_API_TOKEN = "016020ad5cf63aca20b6211d807d2ae578105006"

const orderID = 5316355457315


// Function to fetch Shopify order details
async function getShopifyOrder(orderId) {
    try {
        const response = await axios.get(`https://b83e3e.myshopify.com/admin/api/2023-04/orders/${orderId}.json`, {
            headers: {
                "X-Shopify-Access-Token": SHOPIFY_TOKEN,
                'Content-Type': 'application/json',
            }
        });
        console.log(response.data.order.customer);
        return response.data.order;
    } catch (error) {
        throw new Error(`Failed to fetch Shopify order: ${error.message}`);
    }
}

// Function to find or create a person in Pipedrive
async function findOrCreatePersonInPipedrive(shopifyCustomer) {
    const { email, first_name, last_name, phone } = shopifyCustomer;

    try {
        // Check if person already exists in Pipedrive by email
        const existingPersonResponse = await axios.get(`https://commercial-saw.pipedrive.com/api/v1/persons/search`, {
            params: {
                api_token: PIPEDRIVE_API_TOKEN,
                term: email
            }
        });

        const existingPerson = existingPersonResponse.data.data.items;

        if (existingPerson.length > 0) {
            // Person already exists, return the existing person data
            return existingPerson[0];
        } else {
            // Person doesn't exist, create a new person in Pipedrive
            const newPersonPayload = {
                name: `${first_name} ${last_name}`,
                email: email,
                phone: phone
            };

            const createPersonResponse = await axios.post(`https://commercial-saw.pipedrive.com/api/v1/persons?api_token=${PIPEDRIVE_API_TOKEN}`, {
                ...newPersonPayload
            });

            const newPerson = createPersonResponse.data.data;
            return newPerson;
        }
    } catch (error) {
        throw new Error(`Failed to find or create person in Pipedrive: ${error.message}`);
    }
}


// Function to find or create a product in Pipedrive
async function findOrCreateProductInPipedrive(lineItem) {
    const { sku, name, price } = lineItem;

    try {
        // Check if product already exists in Pipedrive by code (equivalent to Shopify SKU)
        const existingProductResponse = await axios.get('https://commercial-saw.pipedrive.com/api/v1/products/search', {
            params: {
                api_token: PIPEDRIVE_API_TOKEN,
                term: sku
            }
        });

        const existingProduct = existingProductResponse.data.data.items;

        if (existingProduct.length > 0) {
            // Product already exists, return the existing product data
            return existingProduct[0];
        } else {
            // Product doesn't exist, create a new product in Pipedrive
            const newProductPayload = {
                name: name,
                code: sku,
                prices: [{ currency: 'INR', price: price }]
            };

            const createProductResponse = await axios.post(`https://commercial-saw.pipedrive.com/api/v1/products?api_token=${PIPEDRIVE_API_TOKEN}`, {
                ...newProductPayload
            });

            const newProduct = createProductResponse.data.data;
            return newProduct;
        }
    } catch (error) {
        throw new Error(`Failed to find or create product in Pipedrive: ${error.message}`);
    }
}


// Function to create a deal in Pipedrive
async function createDealInPipedrive(person, lineItems) {
    try {
        const dealPayload = {
            title: 'My Deal', // Set the desired title for the deal
            person_id: person.id
        };

        const createDealResponse = await axios.post(`https://commercial-saw.pipedrive.com/api/v1/deals?api_token=${PIPEDRIVE_API_TOKEN}`, {
            ...dealPayload
        });

        const newDeal = createDealResponse.data.data;
        console.log(newDeal);

        // Attach products to the deal
        for (const lineItem of lineItems) {
            const product = await findOrCreateProductInPipedrive(lineItem);

            const attachProductResponse = await axios.post(`https://commercial-saw.pipedrive.com/api/v1/deals/${newDeal.id}/products?api_token=${PIPEDRIVE_API_TOKEN}`, {
                product_id: product.id,
                item_price: product.price,
                quantity: product.quantity
            });

            console.log(`Product '${product.name}' attached to the deal.`);
        }

        return newDeal;
    } catch (error) {
        throw new Error(`Failed to create deal in Pipedrive: ${error.message}`);
    }
}


(async () => {
    try {
        // Step 1: Get Shopify order
        const shopifyOrder = await getShopifyOrder(orderID);

        // Step 2: Find or create person in Pipedrive
        const pipedrivePerson = await findOrCreatePersonInPipedrive(shopifyOrder.customer);


        // Step 3: Find or create products in Pipedrive and attach them to the deal
        const lineItems = shopifyOrder.line_items;
        const newDeal = await createDealInPipedrive(pipedrivePerson, lineItems);

        console.log('Shopify Order:', shopifyOrder);
        console.log('Pipedrive Person:', pipedrivePerson);
        console.log('Created Pipedrive Deal:', newDeal);
    } catch (error) {
        console.error(error);
    }
})();