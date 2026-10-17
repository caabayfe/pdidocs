var gr = new GlideRecord('piwb_sa_stage');
if(gr.get('3ab006a2874300105958bba826cb0b53')) {
	gr.setValue('title', 'Integrate a model');
	gr.update();
}

gr = new GlideRecord('piwb_sa_stage');
if(gr.get('f1def562874300105958bba826cb0b90')) {
	gr.setValue('description', '<p>Define parameters to create a model that will be trained based on your data.<br />You can also create additional models through this step.</p>');
	gr.update();
}

gr = new GlideRecord('piwb_sa_stage_task');
if(gr.get('2fb84aa6874300105958bba826cb0b2c')) {
	gr.setValue('title', 'Test models - use a single or batch testing process to see if a model returns the expected results.');
	gr.update();
}
	
