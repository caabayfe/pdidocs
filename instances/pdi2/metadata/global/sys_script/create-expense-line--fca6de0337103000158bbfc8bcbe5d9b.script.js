createExpLine();

function createExpLine() {
   var gr = new GlideRecord('fm_expense_line');
   gr.addQuery('asset', current.sys_id);
   gr.addQuery('short_description', 'Automatically generated expense line for creation of asset');
   gr.query();
   
	if(current.getTableName() == "alm_license" && current.is_merged_license)
		return;
	
   if (gr.getRowCount() == 0 || current.operation() == 'insert') {
      gr.initialize();
      gr.setValue('asset', current.sys_id);
      gr.setValue('amount', current.cost.getCurrencyCode()+';'+current.cost.getCurrencyValue());
      gr.setValue('state', 'processed');
      gr.setValue('short_description', 'Automatically generated expense line for creation of asset');
      gr.insert();
   } else {
      gr.next();
      gr.setValue('amount', current.cost.getCurrencyCode()+';'+current.cost.getCurrencyValue());
      gr.update();
   }
}
