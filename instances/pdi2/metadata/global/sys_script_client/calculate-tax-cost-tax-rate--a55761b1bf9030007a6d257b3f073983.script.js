function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   var ga = new GlideAjax('ExpenseManagementUtilsAJAX');
   ga.addParam('sysparm_name', 'getTaxAmount');
   ga.addParam('sysparm_salesTax', g_form.getValue('applicable_taxes') === "sales" ? "true" : "false");
   ga.addParam('sysparm_compoundAmount', g_form.getValue('payment_amount'));
   ga.addParam('sysparm_taxRate', g_form.getDecimalValue('tax_rate'));
   ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
   var result = serverResponse.responseXML.getElementsByTagName("result");

   g_form.setValue('tax_cost', result[0].getAttribute("currency") + ';' + result[0].getAttribute("taxCost"));
   g_form.setValue('tax_cost.display', result[0].getAttribute("taxCost"));
   g_form.setValue('tax_cost.currency', result[0].getAttribute("currency"));
   g_form.setValue('total_cost', result[0].getAttribute("currency") + ';' + result[0].getAttribute("amount"));
   g_form.setValue('total_cost.display', result[0].getAttribute("amount"));
   g_form.setValue('total_cost.currency', result[0].getAttribute("currency"));
}
