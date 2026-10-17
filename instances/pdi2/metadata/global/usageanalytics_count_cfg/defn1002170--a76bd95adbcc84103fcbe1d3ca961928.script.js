answer = getDesignatedShiftManagers();
/*
* Count the number of designated shift managers
*/
function getDesignatedShiftManagers() {
	var count = 0;
	var gr = new GlideRecord('on_call_group_preference');
	gr.setCategory("usage");
	gr.addNotNullQuery('rota_managers');
	gr.query();

	while (gr.next())
		count = count + gr.rota_managers.getDisplayValue().split(',').length;

	return count;
}
