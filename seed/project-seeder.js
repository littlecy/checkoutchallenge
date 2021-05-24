var Product = require("../models/product");
var mongoose = require("mongoose");

// connect db
mongoose.connect("localhost:27017/shopping");

var products = [

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 111
    }) ,

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 222
    }) ,

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 333
    }) ,

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 444
    }) ,

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 555
    }) ,

    new Product({
        imagePath: "https://h5.ceibs.edu/files/images/mba/2020gra/decal3-a4.jpg",
        title:"test",
        description:"test test test",
        price: 666
    })

];

var done = 0;
for (var i=0; i<=products.length; i++){
    products[i].save(function (err, result) {
        done++;
        if (done === products.length) {
            exit();
        }

    });


}

function exit() {
    mongoose.disconnect();
}