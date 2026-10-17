function onLoad() {
	new MultiChoiceValidator().validate(g_form.getValue('type'), g_form.getValue('mandatory'), g_form.getValue('do_not_select_first'), g_form.getValue('include_none'));
}

var MultiChoiceValidator = Class.create();
MultiChoiceValidator.prototype = {
	initialize: function() {
	},
	
	validate : function(type, mandatory, do_not_select_first, include_none) {
		if (type == '3' && mandatory == 'true' && do_not_select_first != 'true'  && include_none  != 'true'  )
			g_form.setMandatory('default_value', true);
		else
			g_form.setMandatory('default_value', false);
	},
	
	type: 'MultiChoiceValidator'
};
