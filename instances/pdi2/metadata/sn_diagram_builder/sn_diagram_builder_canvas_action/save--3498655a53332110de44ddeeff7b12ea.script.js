(function(instance) {
	var instanceGr = instance.instance;
	var instanceSysId = instanceGr.getUniqueValue();

	//Update the diagram json field of the diagram instance
	var gr = new GlideRecord('sn_diagram_builder_instance');
	gr.get(instanceSysId);	
	gr.setValue('diagram_json', instance.diagramJSON);
	gr.update();
})(instance);
