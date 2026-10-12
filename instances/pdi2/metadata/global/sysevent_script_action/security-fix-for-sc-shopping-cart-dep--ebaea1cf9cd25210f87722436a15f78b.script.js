var scriptPrefix = "fix_security_issue_sc_shopping_cart_deprecated";
gs.info(scriptPrefix + "Started executing the script");
if (!(GlideCollisionDetector.get().containsKey("sp_widget_f3336978dbaca2007f3bf5131f9619ec")))
	addACLChecks();

gs.info(scriptPrefix + "Ended executing the script");

function addACLChecks() {
var script = "(function() {\n var m = data.msgs = {};\n m.createdMsg = gs.getMessage(\"Created\");\n m.trackMsg = gs.getMessage(\"track using 'Requests' in the header or\");\n m.clickMsg = gs.getMessage(\"click here to view\");\n m.cartEmptiedMsg = gs.getMessage(\"Your cart has been emptied\");\n m.itemRemovedMsg = gs.getMessage(\"has been removed from your cart\");\n m.updatedMsq = gs.getMessage(\"Updated\");\n\n m.quantityToMsg = gs.getMessage(\"quantity to\");\n m.clearCartConfirmationMsg = gs.getMessage(\"Are you sure you want to empty your cart?\");\n var userID = gs.getUser().getID();\n var cart = new SPCart(input.cartName, userID);\n if (input && input.action === \"edit_item\") {\n data.editVariablesModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sp-variable-editor', embeddedWidgetOptions: {sys_id: input.itemID, table: \"sc_cart_item\", showItemTitle: true, isOrdering: true}});\n return;\n } if (input && input.action === \"update_quantity\") {\n var cartItemGR = new GlideRecord(\"sc_cart_item\");\n if (cartItemGR.get(input.itemID) && cartItemGR.canWrite()) {\n cartItemGR.setValue(\"quantity\", input.quantity);\n cartItemGR.update();\n } } if (input && input.action === \"checkout\") { cart.setSpecialInstructions(input.additionalDetails);\n cart.setRequestedFor(input.cart.requested_for);\n cart.setDeliveryAddress(input.deliverTo);\n var request = cart.placeOrder();\n data.requestData = { number: request.getValue(\"number\"), table: request.getTableName(), sys_id: request.getUniqueValue() };\n cart.setSpecialInstructions(\"\");\n cart.setRequestedFor(userID);\n cart.setDeliveryAddress(\"\");\n } if (input && input.action === \"remove_item\") {\n var itemGR = new GlideRecord('sc_cart_item');\n if (itemGR.get(input.removeItemID) && itemGR.canDelete()) itemGR.deleteRecord();\n } if (input && input.action === \"clear_cart\") { cart.clearCart();\n } if (input && input.action === \"save_cart\") {\n var newCart = new SPCart(input.newCartName, userID);\n newCart.loadCart(cart.getCartID());\n } data.sys_properties = { twostep_checkout: gs.getProperty(\"glide.sc.checkout.twostep\", \"false\") == 'true' };\n var cartID = cart.getCartID();\n data.saveCartModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc_save_bundle', embeddedWidgetOptions: {}});\n data.cart = cart.getCartObj();\n data.cartItems = cart.getItems();\n })();";

	var gr = new GlideRecord("sp_widget");
	if (gr.get("f3336978dbaca2007f3bf5131f9619ec")) {
		gr.setWorkflow(false);
		gr.setUseEngines(false);
		gr.setValue("script", script);
		gr.update();
	}

	var action = new GlideRecord("sysevent_script_action");
	if (action.get("ebaea1cf9cd25210f87722436a15f78b")) {
		action.setValue("active", false);
		action.update();
	}
}
