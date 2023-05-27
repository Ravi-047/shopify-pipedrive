# Shopify-Pipedrive Integration

This integration allows you to connect Shopify and Pipedrive, enabling the synchronization of order data and customer information between the two platforms. By following the steps outlined below, you can set up the integration and automate the process of creating deals in Pipedrive based on Shopify orders.

## Prerequisites

### Before getting started, make sure you have the following

1. Shopify account: Set up a Shopify store and obtain the necessary credentials.
2. Pipedrive account: Create a Pipedrive account and generate an API key.

## Installation

1. Clone the repository to your local machine:

   ```javascript
   git clone https://github.com/your-username/shopify-pipedrive
   ```

2. Install the required dependencies:

   ```javascript
   npm install
   ```

3. Configure the integration:

   - Create environment file and provide your Shopify and Pipedrive API credentials.
   - Customize any other configuration settings as required.

## Usage

To use the integration, follow these steps:

1. Get a Shopify order:

   ```javascript
   const orderID = "YOUR_ORDER_ID"; // Replace with the actual order ID
   const shopifyOrder = await getShopifyOrder(orderID);
   ```

2. Find or create a person in Pipedrive:

   ```javascript
   const pipedrivePerson = await findOrCreatePersonInPipedrive(
     shopifyOrder.customer
   );
   ```

3. Find or create products in Pipedrive and Attach products to the deal:

   ```javascript
   const lineItems = shopifyOrder.line_items;
   const newDeal = await createDealInPipedrive(pipedrivePerson.item, lineItems);
   ```

4. Handle success or failure:

   - Please note that this is a simplified example, and you may need to modify the code to fit your specific requirements and data structures

## Error Handling

The integration includes basic error handling for missing or invalid data. If any required fields are missing, an error will be thrown, indicating the specific missing field. Similarly, if the provided orderID is not found in Shopify, an error will be returned.

## Disclaimer

This integration is provided as-is without any warranty. Use it at your own risk. Be sure to review the documentation and guidelines of both Shopify and Pipedrive to ensure compliance with their terms and conditions.
