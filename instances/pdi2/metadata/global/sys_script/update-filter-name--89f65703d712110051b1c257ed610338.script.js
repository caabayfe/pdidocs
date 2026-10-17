updateFilterLabel();

function updateFilterLabel() {
if (!current.name || current.name == '') {
	gs.addInfoMessage('Filter name must not be empty');
	current.setAbortAction(true);
	return;
}
		
// Make sure the updated filter name does not exist. Or else, remind the user.
var gr = new GlideRecord('bsm_map_filter');
gr.addQuery('name', current.name);
gr.addQuery('user', current.user);
gr.addQuery('sys_id', '!=', current.sys_id);
gr.query();
if (gr.next()){
	gs.addInfoMessage('One filter with the same name already exists');
	current.setAbortAction(true);
	return;
}

// update the current filter
	if (current.filter) {
		var newFilter = current.filter.replace(/"label":"[^]*"/ig, '"label":"' + current.name + '"');
		current.filter = newFilter;
	}
}
