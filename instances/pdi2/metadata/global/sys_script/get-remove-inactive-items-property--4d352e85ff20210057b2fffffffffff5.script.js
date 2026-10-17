var removeInactiveItems = gs.getProperty('glide.sc.remove_inactive_cat_items_from_cart');
if (JSUtil.nil(removeInactiveItems))
	g_scratchpad.removeInactiveItems = false;
else
	g_scratchpad.removeInactiveItems = removeInactiveItems;
