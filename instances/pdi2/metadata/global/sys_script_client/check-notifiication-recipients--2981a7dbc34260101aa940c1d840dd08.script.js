function onSubmit() {
   //Type appropriate comment here, and begin script below
   if (g_form.getValue('recipients') == "" && g_form.getValue('condition') == "") {
        g_form.addErrorMessage(getMessage("Please add Static Recipients or Dynamic Conditions"));
        return false;
   }
}
