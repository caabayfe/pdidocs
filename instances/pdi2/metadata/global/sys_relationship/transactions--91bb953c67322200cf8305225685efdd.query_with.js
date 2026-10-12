(function refineQuery(current, parent) {

	// query for transactions in this step
	var atfTransactionGR = new GlideRecord('sys_atf_transaction_mtom');
	atfTransactionGR.addQuery("step_result.sys_id", parent.getUniqueValue());
	atfTransactionGR.query();
	
	var atfTransactionList = [];
	while (atfTransactionGR.next()) {
		atfTransactionList.push(atfTransactionGR.getValue("transaction_id"));
	}
	
	current.addQuery("sys_id", atfTransactionList);
	
})(current, parent);
