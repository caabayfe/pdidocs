var gr = new GlideRecord('sys_dictionary');
gr.addEncodedQuery('name=sys_retry_policy^element=condition');
gr.query();
if(gr.hasNext()){
	gr.next();
	gr.attributes='restrictTo=restrict_to';
	gr.update();
}
