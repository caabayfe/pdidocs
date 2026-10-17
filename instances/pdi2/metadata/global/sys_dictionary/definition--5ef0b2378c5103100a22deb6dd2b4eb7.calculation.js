(function calculatedFieldValue(current) {   
	var ai_config = current.getValue('ai_config');   
	if (ai_config !== '') {   
	 var configGr = new GlideRecord('sys_generative_ai_config');   
	 configGr.get(ai_config);   
	 return configGr.getValue('definition');   
	}   
	return '';   
	})(current);
