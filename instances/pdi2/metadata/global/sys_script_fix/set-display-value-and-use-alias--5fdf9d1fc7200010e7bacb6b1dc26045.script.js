var gr = new GlideRecord('sys_dictionary');
gr.addQuery('element', 'name');
gr.addQuery('name', 'sys_kmf_crypto_module');
gr.query();
if (gr.next()) {
	if (gr.getValue('display') == true){
		gr.setValue("display", false);
		gr.update();
	}
}

var grAlgo = new GlideRecord('sys_dictionary');
grAlgo.addQuery('element', 'padding');
grAlgo.addQuery('name', 'sys_kmf_algorithm');
grAlgo.query();
if (grAlgo.next()) {
	if (grAlgo.getValue('max_length') != 64){
		grAlgo.setValue("max_length", 64);
		grAlgo.update();
	}
}

var grMeta = new GlideRecord('sys_dictionary');
grMeta.addQuery('element', 'kcv');
grMeta.addQuery('name', 'sys_kmf_key_metadata');
grMeta.query();
if (grMeta.next()) {
	if (grMeta.getValue('max_length') != 64){
		grMeta.setValue("max_length", 64);
		grMeta.update();
	}
}
