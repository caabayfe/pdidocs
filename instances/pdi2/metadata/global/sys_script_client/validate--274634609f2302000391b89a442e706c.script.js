function onSubmit() {
   var rotationStartDate = g_form.getValue("rotation_start_date");
   if (rotationStartDate && !isDate(rotationStartDate, g_user_date_format)) {
	   g_form.showFieldMsg("rotation_start_date", getMessage("Invalid date"), "error");
	   return false;
   }
}
