module.exports = function Order(checkoutCart, orderReference){

    if(!checkoutCart) {
        this.items = {};
        this.totalQty =0;
        this.totalPrice =0;
        this.orderRef = "";
    } else {

        this.items = checkoutCart.items;
        this.totalQty = checkoutCart.totalQty;
        this.totalPrice = checkoutCart.totalPrice;
        this.orderRef = orderReference;
    }

    this.generateArray = function (){
        var arr =[];
        for (var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };


};