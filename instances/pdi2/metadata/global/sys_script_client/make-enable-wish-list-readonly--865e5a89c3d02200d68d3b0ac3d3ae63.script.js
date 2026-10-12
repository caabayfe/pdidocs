function onLoad() {
   //Type appropriate comment here, and begin script below
   if (g_scratchpad.cart_layouts == 'false')
	   g_form.setReadOnly('enable_wish_list', true);
	else if (g_scratchpad.doctype_mode == 'false')
		g_form.setDisplay('enable_wish_list', false);
}
