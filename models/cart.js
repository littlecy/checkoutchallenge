module.exports = function Cart(oldCart){

    if(!oldCart) {
        this.items = {};
        this.totalQty =0;
        this.totalPrice =0;
    } else {

        this.items = oldCart.items;
        this.totalQty = oldCart.totalQty;
        this.totalPrice = oldCart.totalPrice;
    }

    this.add = function (item, id){
        var storedItem = this.items[id];

        if(!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }

        if(!this.totalQty){
            this.totalPrice = 0;
            this.totalQty =0;
        };
        this.totalQty++;
        this.totalPrice+= storedItem.item.price * 1;

        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
    };

    this.clearCart = function(){

        this.items = {};
        this.totalQty =0;
        this.totalPrice =0;
    };

    this.generateArray = function (){
        var arr =[];
        for (var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };


};