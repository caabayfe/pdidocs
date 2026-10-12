/**
 * ServiceNow
 *
 * Description:  The idea of this script is to prevent invalid input for fields in the 
 *               Tour Step table.  No spaces are allowed for the window field and only the
 *               following characters are supported for view names: A-Z, a-Z,0-9,_ and - 
**/ 
if (current.window != '') {
	var windowPattern=/\s/;
	if (current.window.match(windowPattern)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The window field cannot contain spaces"));
	}
}
if (current.view != '') {
	var viewPattern=/^(sys_popup,|)[A-Za-z0-9_-]+(,sys_popup|)$/i;

	if (!current.view.match(viewPattern)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("A view name can only contain A-Z, a-z, 0-9, _,  and -"));
	}
}
if(current.guide.type.toString() === 'service_portal'){
		if(current.target_ref.type.toString()!=='' && current.target_ref.type.toString()!=='manual_css'){
			gs.addErrorMessage(gs.getMessage('Invalid Target Referene type'));
			current.setAbortAction(true);	
		}
}
