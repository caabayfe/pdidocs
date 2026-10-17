function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   var fields = newValue.split(",");
   if (fields.length > 1)
       g_form.showFieldMsg('user_dotwalked_field', getMessage("Only one dot-walked field per action is supported"), 'error');
   
}
