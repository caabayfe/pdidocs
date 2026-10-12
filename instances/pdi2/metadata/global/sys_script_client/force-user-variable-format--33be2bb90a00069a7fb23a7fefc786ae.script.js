function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') 
       return;

   var changed = false;

   if (newValue != newValue.toLowerCase()){
       newValue = newValue.toLowerCase();
       changed = true;
   }
	
   if (newValue.indexOf(" ") >= 0) {
	   newValue = newValue.replace(/ /g, "_");
	   changed = true;
   }
	
   if (!g_user.hasRoleExactly('maint') && newValue.substring(0,2) != "u_") {
	   newValue = "u_" + newValue; 
	   changed = true;
   }

   if (changed)
       g_form.setValue('element', newValue);        
}
