var answer = gs.hasRole("catalog_admin");
if (!current.isValidRecord() || (!current.cart.nil() && current.cart.user == gs.getUser().getID())) //For adding attachments if the cart item is transient allow to be added.
	answer = true;
answer;
