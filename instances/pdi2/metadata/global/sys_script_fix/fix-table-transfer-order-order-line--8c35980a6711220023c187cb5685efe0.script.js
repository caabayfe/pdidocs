populateTransOrderNumEntry();
populateTransOrderLineNumEntry();

function populateTransOrderNumEntry(){
	var sysNumberGr = new GlideRecord('sys_number');
	sysNumberGr.addQuery('category', 'alm_transfer_order');
	sysNumberGr.query();
	
	if(!sysNumberGr.next()) {
		sysNumberGr.initialize();
		sysNumberGr.category = 'alm_transfer_order';
		sysNumberGr.maximum_digits = '7';
		sysNumberGr.number = '10000';
		sysNumberGr.prefix = 'TO';
		sysNumberGr.insert();
	}
}

function populateTransOrderLineNumEntry(){
	var sysNumberGr = new GlideRecord('sys_number');
	sysNumberGr.addQuery('category', 'alm_transfer_order_line');
	sysNumberGr.query();
	
	if(!sysNumberGr.next()) {
		sysNumberGr.initialize();
		sysNumberGr.category = 'alm_transfer_order_line';
		sysNumberGr.maximum_digits = '7';
		sysNumberGr.number = '10000';
		sysNumberGr.prefix = 'TOL';
		sysNumberGr.insert();
	}
}
