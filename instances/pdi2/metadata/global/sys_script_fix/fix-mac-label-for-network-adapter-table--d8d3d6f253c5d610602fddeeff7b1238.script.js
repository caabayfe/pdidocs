capitalizeMac();

function capitalizeMac(){
	if(pm.isZboot()){
		return;
	}

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name','cmdb_ci_network_adapter');
	gr.addQuery('element', 'mac_manufacturer');
	gr.query();

	if(gr.next() && gr.getValue('column_label').equals('Mac manufacturer')){
		gr.setValue('column_label','MAC manufacturer');
		gr.update();
	}

	var docGr = new GlideRecord('sys_documentation');
	docGr.addQuery('name', 'cmdb_ci_network_adapter');
	docGr.addQuery('element', 'mac_manufacturer');
	docGr.addQuery('language', 'en');
	docGr.query();

	if(docGr.next()){
	    var needsUpdate = false;
	    if(docGr.getValue('label').equals('Mac manufacturer')){
		    docGr.setValue('label', 'MAC manufacturer');
		    needsUpdate = true;
		}

	    if(docGr.getValue('plural').equals('Mac manufacturers')){
		    docGr.setValue('plural', 'MAC manufacturers');
		    needsUpdate = true;
		}

        if(needsUpdate)
		    docGr.update();
	}
}
