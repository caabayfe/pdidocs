function onCondition() {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'glide.nlu.model.purpose.iar.enable');
	gr.query();
	
	//Converts the string value to boolean
	if(gr.next()){
    g_form.setVisible('nlu_model', gr.getValue('value') === 'true');
	}
  
}
