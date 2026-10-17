function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //Only take action if field is on screen
   if (!g_form.getControl('manufacturer'))
	   return;
   var m = g_form.getReference('model_id', modelIdValue);
}

function modelIdValue(modelId) {
   g_form.setValue('manufacturer', modelId.manufacturer);
}
