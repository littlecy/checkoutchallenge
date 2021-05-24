var express = require('express');
var axios = require("axios");
var Cart = require("../models/cart");
var Order = require("../models/order");
var Product = require("../models/product");
const {Config} = require("@adyen/api-library");
const {uuid} = require('uuidv4');
const url = require("url");
var router = express.Router();

var config = new Config();
config.apiKey = process.env.API_KEY;
config.merchantAccount = process.env.MERCHANT_ACCOUNT;
config.environment = "TEST";



router.get("/success", function(req, res, next){
    res.render("success");
})


/* GET home page. */
router.get('/', function(req, res, next) {

  var products = Product.find(function(err,docs){
    console.log(docs);
    var retriveproduct = [];
    for (var i=0;i<docs.length;i++){
      retriveproduct.push(docs[i].toJSON());
    }

    var productChunks = [];
    var chunkSize = 3;

    for (var i=0; i< retriveproduct.length;i+= chunkSize){
      productChunks.push(retriveproduct.slice(i,i+chunkSize));
    }

    res.render('index', { title: 'Checkout Challenge', products: productChunks });
  });
});


router.get("/add-to-cart/:id", function (req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{items:{}});

  Product.findById(productId, function(err, product){
      if(err){
        console.log(err);
        return res.redirect("/");
      }
      //newProduct = product.toJSON();
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect("/");
  });
});

// view items in shopping cart
router.get('/shopping-cart', function (req, res, next){
   if(!req.session.cart){
       return res.render('shopping-cart', {products:null});
   }
    var cart = new Cart(req.session.cart);
    res.render('shopping-cart', {products:cart.generateArray(), totalPrice:cart.totalPrice})
});


//get payment methods to render drop-in
router.get('/payment', function (req, res, next){
    // if nothing in shopping cart, redirect
    /*
    if(!req.session.cart){
        return res.redirect('/shopping-cart');
    }

    // direct to payment page
    var cart = new Cart(req.session.cart);*/
    //res.render("payment",{total:cart.totalPrice});

    // get payment methods
    try{


    axios.post('https://checkout-test.adyen.com/v66/paymentMethods',
        //"allowedPaymentMethods":["card","alipay"]
        { merchantAccount: process.env.MERCHANT_ACCOUNT},
        {headers: {
            'Authorization': process.env.API_KEY}})
            .then((response) => {

                res.render("payment",{

                    clientKey: process.env.CLIENT_KEY,
                    response: JSON.stringify(response.data)

                });
            }, (error) => {
                console.log(error);
            });
    }
    catch (e) {
        console.error("error -- ", e);

    }

});





// call: api/payments
router.post("/api/initiatePayment",async (req, res) => {
    var cart = new Cart(req.session.cart);


    if(cart.items.length==0){
        console.log("empty cart");
        res.redirect("/");
    } else{

        //const currency = findCurrency(req.body.paymentMethod.type); --> hardcode to usd
        // find shopper IP from request
        const shopperIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        try {
            // unique ref for the transaction
            const orderRef = uuid();
            // Ideally the data passed here should be computed based on business logic
            //var order = new Order(cart, orderRef);
            // initialize data to pass on to api
            const payment_data = {
                amount: {currency:"USD", value: cart.totalPrice * 100 }, // value is 10€ in minor units
                reference: "chenying_checkoutChallenge", // required
                merchantAccount: process.env.MERCHANT_ACCOUNT, // required
                channel: "Web", // required
                additionalData: {
                    // required for 3ds2 native flow
                    allow3DS2: true,
                },
                origin: "http://localhost:3000/payment", // required for 3ds2 native flow
                browserInfo: req.body.browserInfo, // required for 3ds2
                shopperIP, // required by some issuers for 3ds2
                returnUrl: `http://localhost:3000/api/handleShopperRedirect?orderRef=${orderRef}`, // required for 3ds2 redirect flow
               // returnUrl: http://localhost:3000/api/handleShopperRedirect", // required for 3ds2 redirect flow
                paymentMethod: req.body.paymentMethod,
                socialSecurityNumber: req.body.socialSecurityNumber,
                shopperName: req.body.shopperName,
                billingAddress:
                    typeof req.body.billingAddress === "undefined" || Object.keys(req.body.billingAddress).length === 0
                        ? null
                        : req.body.billingAddress,
                deliveryDate: "2023-12-31T23:00:00.000Z",
                shopperStatement: "Aceitar o pagamento até 15 dias após o vencimento.Não cobrar juros. Não aceitar o pagamento com cheque",
                shopperReference: "checkout_123456789",
                shopperEmail: "youremail@email.com",
                shopperLocale: "en_US",
/*
                lineItems: [
                    {
                        quantity: "1",
                        amountExcludingTax: "331",
                        taxPercentage: "2100",
                        description: "Shoes",
                        id: "Item 1",
                        taxAmount: "69",
                        amountIncludingTax: "400",
                    },
                    {
                        quantity: "2",
                        amountExcludingTax: "248",
                        taxPercentage: "2100",
                        description: "Socks",
                        id: "Item 2",
                        taxAmount: "52",
                        amountIncludingTax: "300",
                    },
                ],


 */
            };

            axios.post('https://checkout-test.adyen.com/v66/payments', payment_data,{headers: {
                    'Authorization': process.env.API_KEY}})
                .then(function(response) {

                    var sessionData = req.session;
                    sessionData.paymentData = response.data.paymentData;

                    res.send(response.data);


                })
                .catch( function(error) {
                    console.log(error);
                });
        }
        catch (e) {
            console.error("error -- ", e);
        }

    }
});

// call: api /payment/details
router.post("/api/submitAdditionalDetails", async(req, res, next)=>{

    console.log("additional data body ---", req.body);
    axios.post('https://checkout-test.adyen.com/v66/payments/details', req.body,{headers: {
            'Authorization': process.env.API_KEY}})
        .then(function(response) {

            console.log("additional details response",response.data);

            res.send(response.data);
        })
        .catch( function(error) {
            console.log(error);
        });


})

//handle redirect such as alipay
router.get("/api/handleShopperRedirect", async(req, res, next)=>{

    const current_url = new URL ("http://localhost:3000" + req.url);
    const search_params = current_url.searchParams;
    const redirectResult = search_params.get("redirectResult");


    const additional_data = {

        "paymentData":req.session.paymentData,
        "details":{
            "redirectResult": redirectResult,
        }
    }

    axios.post('https://checkout-test.adyen.com/v66/payments/details', additional_data,{headers: {
            'Authorization': process.env.API_KEY}})
        .then(function(response) {


            switch (response.data.resultCode) {
                case "Authorised":
                    //clean up cart
                    req.session.cart= null;
                    res.redirect("http://localhost:3000/success");
                    break;
                case "Pending":
                    res.redirect("http://localhost:3000/pending");
                    break;
                case "Refused":
                    res.redirect("http://localhost:3000/failed");
                    break;
                default:
                    res.redirect("http://localhost:3000/error");
                    break;
            }

        })
        .catch( function(error) {
            console.log(error);
        });
});

module.exports = router;
