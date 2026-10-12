deleteTOLs();

function deleteTOLs(){
	var tolGr = new GlideRecord('alm_transfer_order_line');
	tolGr.addQuery('transfer_order',current.sys_id);
	tolGr.query();
	while (tolGr.next())
		tolGr.deleteRecord();
}
