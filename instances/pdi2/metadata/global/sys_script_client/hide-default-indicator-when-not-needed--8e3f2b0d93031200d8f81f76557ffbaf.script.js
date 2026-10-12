function onLoad() {
 if (g_form.isNewRecord()){
   g_form.setVisible('default_indicator', false);
 } else {
	 var sysId = g_form.getUniqueValue();	 
	 var gr = new GlideRecord('pa_widget_indicators');
	 gr.setLimit(2);
	 gr.addQuery('widget', sysId);
	 gr.query();
	 
	 var count = 0;
	 while (gr.next()) {
		 count++;
	 }

	 if (count < 2)
		 g_form.setVisible('default_indicator', false);

 }
}
