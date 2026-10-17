function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

   /* If the scheduled report is set to run as a user different than the current, 
   warn that the resulting report might look different than expected (possibly blank)*/
   if (newValue != g_user.userID) {
      g_form.showFieldMsg(control.name, getMessage('Data that the user selected in the Run as field does not have access to will be excluded from the generated report.'));
   }
}
