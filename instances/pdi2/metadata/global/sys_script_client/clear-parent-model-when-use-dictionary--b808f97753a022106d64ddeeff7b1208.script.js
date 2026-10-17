function onSubmit() {
   //If use_dictionary is true the graph can't have a parent
   //If a graph has no parent it shouldn't have a model either (though it is irrelevant)
   if (g_form.getBooleanValue('use_dictionary') == false)
		return true;

   if (g_form.getValue('parent') != '' && g_form.getValue('parent') != '') {
		g_form.setValue('parent', null);
   }
   if (g_form.getValue('model') != '' && g_form.getValue('model') != '') {
		g_form.setValue('model', null);
   } 

}
