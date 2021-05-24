//import AdyenCheckout from '@adyen/adyen-web'
//import '@adyen/adyen-web/dist/adyen.css';

//var axios = require("axios");

const paymentMethodsResponse = JSON.parse(
    document.getElementById("paymentMethodsResponse").innerHTML
);

const clientKey = document.getElementById("clientKey").innerHTML;

const configuration = {
    paymentMethodsResponse,
    clientKey,
    locale: "en_US",
    environment: "test",
    paymentMethodsConfiguration: {
        card: {
            hasHolderName: true,
        },
    },
    onSubmit: (state, component) => {
        handleSubmission(state, component, "/api/initiatePayment");
    },
    onAdditionalDetails: (state, component) => {
        handleSubmission(state, component, "/api/submitAdditionalDetails");
    },
};

// Event handlers called when the shopper selects the pay button,
// or when additional information is required to complete the payment
async function handleSubmission(state, component, url) {

    try {
        const response = await callServer(url, state);
        return handleServerResponse(response, component);
    } catch (err) {
        console.error(err);
    }
}

async function callServer(url, data) {
    try {

        const req_data = {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(data.data),
            headers: {
                "Content-Type": "application/json",
            }
        };

        const response = await fetch(url,req_data);
        console.log(response);
        return await response.json();

    } catch (error) {
        console.error(error);
    }
}

// Handles responses sent from your server to the client
function handleServerResponse(res, component) {

    if (res.action) {

        console.log("action -------", res.action);
        component.handleAction(res.action);
    } else {
        //console.log(JSON.stringify(res.data));
        switch (res.resultCode) {
            case "Authorised":


                window.location.href = "/success";

                sessionStorage.clear();

                this.cart = null;
                break;
            case "Pending":
                window.location.href = "/pending";
                break;
            case "Refused":
                window.location.href = "/failed";
                break;
            default:
                window.location.href = "/error";
                break;
        }
    }
}



const checkout = new AdyenCheckout(configuration);

const integration = checkout
    .create("dropin")
    .mount(document.getElementById("dropin-container"));