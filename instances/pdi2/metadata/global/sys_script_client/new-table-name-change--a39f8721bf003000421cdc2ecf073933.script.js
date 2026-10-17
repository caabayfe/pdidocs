function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || control.defaultValue.length > 0) {
      return;
   }
   
   // assumes one embedded list table on the new form view with class name list_table
   var table = $$('table.list_table')[0];
   if(table != null) {
	   var obj = {control:control, oldValue:oldValue, newValue:newValue, isLoading:isLoading, isTemplate:isTemplate, columnName:'name'};
   	   $(table).fire('glide:list_v2.edit.update_column', obj);
   }
}
