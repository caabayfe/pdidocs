function onChange(control, oldValue, newValue, isLoading) {
   var table = new Table(g_form.getValue('target_table'));
   if (isLoading)
      newValue = oldValue;

   var el = table.getElement(newValue);
   var displayChoiceAction = false;

   if (el && (el.type == "reference" || el.choice != "0" || el.type == "glide_list"))
      displayChoiceAction = true;

   g_form.setDisplay('choice_action', displayChoiceAction);
	

   if (el && (el.type == "reference" || (el.type == "glide_list" && el.reference)))
      g_form.setDisplay('reference_value_field', true);
   else
      g_form.setDisplay('reference_value_field', false);
}
