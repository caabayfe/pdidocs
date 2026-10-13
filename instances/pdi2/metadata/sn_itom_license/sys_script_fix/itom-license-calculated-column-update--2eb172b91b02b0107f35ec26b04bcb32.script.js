var calclulatedString = "(function calculatedFieldValue(current) {if(current.status == 'running' || current.status == 'completed') {var  installCount = 0;var gr = new GlideAggregate('itom_lu_licensable_cis');gr.addQuery('value_stream', current.value_stream);gr.addQuery('sku', current.sku);gr.addAggregate('COUNT');gr.query();if(gr.next()) {installCount = gr.getAggregate('COUNT');}return installCount +'/' + current.max_results;} else {return 'N.A.';}})(current)";

var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name','itom_lu_licensable_cis_trigger');
gr.addQuery('element','progress');
gr.query();

while(gr.next()) {
gr.setValue('calculation',calclulatedString);
if(gr.update());
	gs.info('In itom_lu_licensable_cis_trigger caluclated column progress has been updated');
}
