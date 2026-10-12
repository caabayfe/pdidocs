function onSubmit() {
   if (g_form.getActionName() != 'BackOut')
       return true;

   var msg = formatMessage(getMessage("Are you sure you want to permanently remove all customizations in the {0} update set"), g_form.getValue('name')) + "?";
   return confirm(msg);
}
