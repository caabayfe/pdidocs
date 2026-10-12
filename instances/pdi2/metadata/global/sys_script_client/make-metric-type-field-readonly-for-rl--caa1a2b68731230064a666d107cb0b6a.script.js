function onLoad() {
	  if (g_form.getValue("metric_type") != "")
		  g_form.setReadOnly("metric_type", true);
	  else 
		  g_form.setReadOnly("metric_type", false);
}
