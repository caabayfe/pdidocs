function onLoad() {
   if (!g_form.isNewRecord())
	   return;
   var setId = g_form.getValue('set');
   var order = WFStageSet.incrementStageCounter(setId); 
   g_form.setValue('order', order);
}
