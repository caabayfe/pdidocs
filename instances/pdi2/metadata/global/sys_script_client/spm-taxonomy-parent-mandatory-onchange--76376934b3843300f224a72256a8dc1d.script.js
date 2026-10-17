function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var portfolio = g_form.getValue('spm_service_portfolio');
	var layer = g_form.getValue('spm_taxonomy_layer');

  	if (!portfolio || !layer)
		  return;
      
	var ga = new GlideAjax('global.SPMClientUtilAjax');
	ga.addParam('sysparm_name', 'isRootLayer');
	ga.addParam('sysparm_portfolio', portfolio);
	ga.addParam('sysparm_layer', layer);
	ga.getXML(toggleField);
}

function toggleField(response){
	// isRootLayer returns either "true" or "false"
	var isRootLayer = response.responseXML.documentElement.getAttribute('answer');
		
	// If it is the "root" (lowest "order" value) layer, then "Parent" is not required
	if (isRootLayer == "true"){
		g_form.setMandatory('parent', false);
		g_form.setDisplay('parent', false);
	} else {
		g_form.setMandatory('parent', true);
		g_form.setDisplay('parent', true);
	}					
}
