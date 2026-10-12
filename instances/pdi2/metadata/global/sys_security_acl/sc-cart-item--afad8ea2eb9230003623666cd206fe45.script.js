var answer = gs.hasRole("catalog_admin");
if (!current.cart.nil() && current.cart.user == gs.getUser().getID())
	answer = true;
answer;
