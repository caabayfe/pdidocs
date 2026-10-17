var target_mapping = new Array();

target_mapping['order_item'] 			= 'browser_widget';
target_mapping['shopping_cart']	  	= 'browser_widget';
target_mapping['cart_view'] 		 	= 'browser_screen';
target_mapping['this_item_order_guide']  = 'browser_widget';
target_mapping['cart_view_two_step'] 	= 'browser_screen';
target_mapping['order_status'] 		  = 'browser_screen';
target_mapping['mobile_cart_view'] 	  = 'mobile_screen';
target_mapping['mobile_order_status']    = 'mobile_screen';

current.target_type = target_mapping[current.target];
