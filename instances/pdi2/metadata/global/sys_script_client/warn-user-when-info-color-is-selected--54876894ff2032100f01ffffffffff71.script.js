function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var color = g_form.getValue('color');
   if(color === "info") {
	g_form.showFieldMsg("color", getMessage("This colour may conflict with the unsaved field indicator background."));
   } else {
	g_form.hideFieldMsg("color");
   }

   //Type appropriate comment here, and begin script below
   
}
