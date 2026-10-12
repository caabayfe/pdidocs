	var cGr = new GlideRecord('alm_consumable');
    if (cGr.get(consumable) && cGr.canRead()) {


    if(cancelled == "false" && asset == "" && user != ""){
	var gr = new GlideRecord('sys_user');
	gr.get(user);
	var location = gr.getValue('location');
	var userDetails= {
	cost_center: gr.getValue('cost_center'),
	department: gr.getValue('department'),
	company: gr.getValue('company'),
	};
	new Consumables().splitForeground(consumable, qty, '10', '', asset, '', location, user, userDetails);
	}
	else if (cancelled == "false" && asset != "") {
		var new_sys_id = new Consumables().splitForeground(consumable, qty, '10', '', asset, '', '', user);
	}

	if (from_workspace !== "true")
		response.sendRedirect("alm_consumable.do?sys_id=" + consumable);

}else{
	gs.addErrorMessage(gs.getEscapedMessage("You aren't authorized to access the record."));
}	
