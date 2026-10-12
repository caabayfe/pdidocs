function onLoad() {
   //get the parent
   var parentTable = g_form.getReference("parent");

   if (typeof parentTable.sys_id !== 'undefined'){
		// if it's not empty, set the table field to the current form and
		g_form.setValue("table",parentTable.table);
	    
	   // set readonly table and parent fields
	    g_form.setReadOnly("table",true);
	   	g_form.setReadOnly("parent",true);
   }
}
