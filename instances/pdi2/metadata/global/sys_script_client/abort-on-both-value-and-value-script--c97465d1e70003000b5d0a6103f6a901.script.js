function onSubmit() {
   if (g_form.getValue('value') && g_form.getValue('value_script')) {
	   alert(getMessage('Both value and value_script fields have values.  Only one can be populated.  Aborting save.'));
	   return false;
   }
}
