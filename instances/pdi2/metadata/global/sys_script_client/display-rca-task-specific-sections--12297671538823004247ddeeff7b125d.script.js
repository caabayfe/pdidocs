function onLoad() {
   if (g_form.getValue('problem_task_type') == 'rca') {
	   g_form.setSectionDisplay('analysis_information', true);
	   g_form.setDisplay('close_notes', false);
   }
   else {
	   g_form.setSectionDisplay('analysis_information', false);
	   g_form.setDisplay('close_notes', true);
   }
   if (g_form.getValue('problem_task_type') == 'rca' && g_form.getValue('close_code') == 'canceled')
	   g_form.setDisplay('close_notes', true);
}
