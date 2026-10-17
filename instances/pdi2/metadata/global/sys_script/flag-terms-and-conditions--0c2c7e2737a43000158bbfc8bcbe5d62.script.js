var gr = new GlideRecord('clm_terms_and_conditions');
gr.get(current.terms_and_conditions);
if (current.operation() == 'insert') {
	gr.setValue('used', true);
	gr.setValue('contract', current.contract);
} else {
	gr.setValue('used', false);
	gr.setValue('contract', '');
}
gr.update();
