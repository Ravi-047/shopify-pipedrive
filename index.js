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
        return response.data.order.customer;
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

            const createPersonResponse = await axios.post(`https://commercial-saw.pipedrive.com/api/v1/persons`, {
                api_token: PIPEDRIVE_API_TOKEN,
                ...newPersonPayload
            });

            const newPerson = createPersonResponse.data.data;
            return newPerson;
        }
    } catch (error) {
        throw new Error(`Failed to find or create person in Pipedrive: ${error.message}`);
    }
}


(async () => {
    try {
        // Step 1: Get Shopify order
        const shopifyOrder = await getShopifyOrder(orderID);

        // Step 2: Find or create person in Pipedrive
        const pipedrivePerson = await findOrCreatePersonInPipedrive(shopifyOrder);

        console.log('Shopify Order:', shopifyOrder);
        console.log('Pipedrive Person:', pipedrivePerson);
    } catch (error) {
        console.error(error);
    }
})();