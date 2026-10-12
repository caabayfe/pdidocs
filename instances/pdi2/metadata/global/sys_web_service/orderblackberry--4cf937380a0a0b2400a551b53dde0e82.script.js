var cart = new Cart();
var item = cart.addItem('e2132865c0a8016500108d9cee411699');
cart.setVariable(item, 'original', request.phone_number);

// set the requested for
var gr = new GlideRecord("sys_user");
gr.addQuery("user_name", request.requested_for);
gr.query();
if (gr.next()) {
  var cartGR = cart.getCart();
  cartGR.requested_for = gr.sys_id;
  cartGR.update();
}

var rc = cart.placeOrder();
response.request_number = rc.number;
