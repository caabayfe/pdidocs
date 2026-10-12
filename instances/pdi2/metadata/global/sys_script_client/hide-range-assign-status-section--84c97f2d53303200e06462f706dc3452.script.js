function onLoad() {
   //Hide Range Assign status section when status it is null
	if(g_form.getValue("range_assign_status") == ""){
		g_form.setSectionDisplay("range_assignmentstatus",false);
	}
}
