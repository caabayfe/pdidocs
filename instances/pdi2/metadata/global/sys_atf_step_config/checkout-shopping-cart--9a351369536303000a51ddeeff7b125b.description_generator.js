function generateDescription(step) {
	var description = "";
	if (step.inputs.assert_type == "empty_cart")
		description = gs.getMessage("Check if shopping cart is empty");
	else
		description = gs.getMessage("Checkout Cart and confirm that all the items in the cart have been checked out");
	return description;
}
 generateDescription(step);
