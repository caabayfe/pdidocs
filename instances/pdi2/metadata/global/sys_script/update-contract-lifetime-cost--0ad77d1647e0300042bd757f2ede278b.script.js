this.calcLifetime(current.contract);

function calcLifetime(contract) {
    var expenseLines = new GlideRecord('fm_expense_line');
    expenseLines.addQuery('source_id', contract.sys_id);
	expenseLines.query();
	var amount = 0;
    while (expenseLines.next()) {
		amount += parseFloat(expenseLines.amount);
	}
	var gr = new GlideRecord('ast_contract');
	gr.get(contract.sys_id);
	gr.lifetime_cost = amount;
	gr.update();
}
