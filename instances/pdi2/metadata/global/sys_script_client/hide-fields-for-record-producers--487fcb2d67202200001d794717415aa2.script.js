function onLoad() {
   
   var appliesTo = g_form.getValue('applies_to');
   if (appliesTo == 'item') {
	   catItem = g_form.getValue('cat_item');
	   if(catItem) {
		   var gr = new GlideRecord('sc_cat_item_producer');
		   // If the ref catalog item is of type record producer
		   if(gr.get(catItem)){
			   g_form.setDisplay('applies_req_item', false);
			   g_form.setDisplay('applies_sc_task', false);
		   } else
			   g_form.setDisplay("applies_target_record", false);
	   }
   }
}
