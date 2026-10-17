// The Condition Field must be a field that is a reference to cmn_condition_checker

validateConditionField();


function validateConditionField() {
   var field = current.condition_field + '';
   var table = current.table + '';
   if (!table || !field) {
      setConditionFieldError();
      return;
   }
   
   var td = GlideTableDescriptor.get(table);
   var ed = td.getElementDescriptor(field);
   if (!ed) {
      setConditionFieldError();
      return;
   }

   if ((ed.getInternalType().toString() !== 'reference') || (ed.getReference().toString() !== 'cmn_condition_checker')) {
      setConditionFieldError();
      return;
   }
}


function setConditionFieldError() {
   current.condition_field.setError(gs.getMessage('Condition field must be a field that is a reference to a Condition (cmn_condition_checker).'));
   current.setAbortAction(true);
}
