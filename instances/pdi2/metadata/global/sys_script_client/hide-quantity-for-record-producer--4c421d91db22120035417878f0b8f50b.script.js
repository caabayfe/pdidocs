function onLoad() {
   //Check if its record producer
   var cat_item = g_form.getReference('item');
   if(cat_item.sys_class_name == 'sc_cat_item_producer'){
	   g_form.setVisible('quantity',false);
	    g_form.setVisible('show_quantity',false);
   }
   else{
	   g_form.setVisible('quantity',true);
	   g_form.setVisible('show_quantity',true);
   } 
}
