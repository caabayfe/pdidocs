runUIAction();

function runUIAction() {
	current.update();
	// show Business Service Map
	action.setReturnURL(current);
	
	action.setRedirectURL('$sa_manual_bs_map.do?sysparm_bsid=' + current.sys_id + 
						  '&sysparm_bsname=' + current.name +
						  '&sysparm_plugin_mode=assurance&sysparam_back_ref=manual_table');
}
