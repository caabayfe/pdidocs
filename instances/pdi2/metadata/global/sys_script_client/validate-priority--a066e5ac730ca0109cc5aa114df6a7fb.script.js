function onSubmit() {
   //Type appropriate comment here, and begin script below
   var priority = g_form.getIntValue('priority');
   if (priority < 1) {
       g_form.addErrorMessage(getMessage("Please enter a positive value for priority."));
       return false;
   }
}
