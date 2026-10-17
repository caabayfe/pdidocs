function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }
	g_form.getReference("kb_knowledge_base", function(response) {
			if(response.kb_version == 2) {
			
				g_form.setDisplay("can_read_user_criteria", false);
				g_form.setDisplay("cannot_read_user_criteria", false);
			}else{
				g_form.setDisplay("can_read_user_criteria", true);
				g_form.setDisplay("cannot_read_user_criteria", true);
			}
		});
   //Type appropriate comment here, and begin script below
   
}
