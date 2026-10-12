function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var eval_strategy = g_form.getValue("scope");
   if (eval_strategy === "ALL") {
	   g_form.setVisible("selected_artifacts", false);
   }
   if (eval_strategy === "SELECTED") {
	   g_form.setVisible("selected_artifacts", true);
   } 
}
