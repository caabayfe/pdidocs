function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }

   if (newValue === '') {
	   g_form.clearValue('no_cart_v2');
	   g_form.clearValue('no_quantity_v2');
	   g_form.clearValue('no_delivery_time_v2');
	   g_form.clearValue('no_wishlist_v2');
   }
   
	if (newValue === 'request') {
	   g_form.setValue('no_cart_v2', true);
	   g_form.setValue('no_quantity_v2', true);
	   g_form.clearValue('no_delivery_time_v2');
	   g_form.clearValue('no_wishlist_v2');
   }
	
   if (newValue === 'submit') {
	   g_form.setValue('no_cart_v2', true);
	   g_form.setValue('no_quantity_v2', true);
	   g_form.setValue('no_delivery_time_v2', true);
	   g_form.clearValue('no_wishlist_v2');
   }
   
}
