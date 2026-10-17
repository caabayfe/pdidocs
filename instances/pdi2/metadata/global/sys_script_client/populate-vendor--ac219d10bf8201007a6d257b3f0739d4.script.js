function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
    //if the contract field is filled in but not the vendor, populate the Vendor field
	if(g_form.getValue('vendor')== ''){
		var rec = new GlideRecord('ast_contract');
		rec.get(newValue);
		g_form.setValue('vendor', rec.vendor);
	}
   
}
