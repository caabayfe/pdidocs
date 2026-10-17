function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) 
      return;

   if (newValue == '') {
      g_form.setValue('company', '');
      return;
   }

   if (!g_form.getControl('company'))
      return;

   var caller = g_form.getReference('caller', setCompany);
}

function setCompany(caller) {
   if (caller)
       g_form.setValue('company', caller.company);
}
