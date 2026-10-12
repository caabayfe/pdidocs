function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

   if (newValue == "task") {
		g_form.setDisplay("task", true);
		g_form.setDisplay("knowledge_article", false);
   } else {
		g_form.setDisplay("task", false);
		g_form.setDisplay("knowledge_article", true);
   }
}
