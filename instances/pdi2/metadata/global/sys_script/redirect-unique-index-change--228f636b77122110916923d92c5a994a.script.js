(function executeRule(current, previous /*null when async*/) {

	var al = GlideStringUtil.split(current.element);
	var id = new GlideIndexDescriptor(current.name, '', al);
	id.setUnique(false);
	var hasNonUniqueIndex = id.hasIndex();

	id.setUnique(true);
	var hasUniqueIndex = id.hasIndex();

	var linkTandC = '<a href="/table_columns.do" >' + 'Tables & Columns' + '</a>';
	var gr = new GlideRecord("sys_db_object");
	gr.addQuery('name', current.name);
	gr.query();
	var tableSysId;
	if(gr.next())
		tableSysId = gr.sys_id;

	var linkDBObj = '<a href="/sys_db_object.do?sys_id=' + tableSysId +'">' + 'Table' + '</a>';
	var redirectMessage = ' use IndexCreator in the ' + linkTandC + ' page or in this column\'s ' + linkDBObj + ' record';

	if (current.unique == true) {
		if (hasNonUniqueIndex) {
			current.setAbortAction(true);
			var msg = gs.getMessage('A non-unique index exists on this column. To create a unique index for this column');
			msg += redirectMessage;
			gs.addErrorMessage(msg);
		}
	} else {
		if (hasUniqueIndex) {
			current.setAbortAction(true);
			var msg2 = gs.getMessage('A unique index exists on this column. To create a non-unique index for this column');
			msg2 += redirectMessage;
			gs.addErrorMessage(msg2);
		}
	}

})(current, previous);
