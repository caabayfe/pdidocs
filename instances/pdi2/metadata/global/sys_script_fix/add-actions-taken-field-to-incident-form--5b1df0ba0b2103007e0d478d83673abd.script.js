var gr = new GlideRecord('sys_properties');
if(gr.get('name','glide.ui.incident_activity.fields')){
	var value = gr.getValue('value');
	if(value){
		if(value.split(",").indexOf("actions_taken") === -1){
			gr.value = value + ',actions_taken';
			gr.update();
		}
	} else {
		gr.value = 'work_notes,comments,actions_taken';
		gr.update();
	}
} else {
	gr = new GlideRecord('sys_properties');
	gr.name = 'glide.ui.incident_activity.fields';
	gr.value = 'work_notes,comments,actions_taken';
	gr.description = 'List of fields (comma-separated) that appear in the activity formatter for Incident.';
	gr.type = 'string';
	gr.insert();
}
