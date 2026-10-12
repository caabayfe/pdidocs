insertType();

function insertType() {
		
	// Make sure the updated type is unique
	var gr = new GlideRecord('bsm_map_icon');
	gr.addQuery('type', current.type);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		gs.addInfoMessage('Type already exists');
		current.setAbortAction(true);
	} else
		current.name = current.type.name;
}
