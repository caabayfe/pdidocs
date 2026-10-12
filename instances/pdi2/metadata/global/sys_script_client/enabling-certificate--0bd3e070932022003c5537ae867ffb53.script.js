function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue == "true") {
	   //when enabling the certificate, we will enable the notification as well
	   g_form.setValue("expiration_notification", true);
   }   
}
