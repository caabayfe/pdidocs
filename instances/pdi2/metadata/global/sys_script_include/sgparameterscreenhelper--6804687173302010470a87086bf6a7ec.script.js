var SGParameterScreenHelper = Class.create();
SGParameterScreenHelper.prototype = {
    initialize: function() {
    },

	getParameterScreenReferenceQualifier: function(){
		return "sys_class_name=sys_sg_parameter_screen^ORsys_class_name=sys_sg_scripted_screen";
	},

	getFilteredScreenRefQual: function(){
		return "sys_class_name!=sys_sg_parameter_screen^sys_class_name!=sys_sg_scripted_screen";
	},

	getInputTypeRefQual: function(){
		return true;
	},

	getAutofillVariableRefQual: function(current){
		if (current.parameter_section) {
			return "parameter_section=" + current.parameter_section;
		} else if (current.parameter_screen) {
			return "parameter_screen=" + current.parameter_screen;
		}

		return "parameter_screen=^parameter_section=";
	},

	/*
		Reference qualifier for parameterized screen
	*/
	getParameterizedScreenRefQual: function() {
		return 'presentation_style!=screen^EQ';	
	},

	/*
		Returns a collection of screen classes that can be configured as Parameterized Screen
	*/
	getParameterizedScreenClasses: function() {
		var classes = [];
		classes.push('sys_sg_map_screen');
		classes.push('sys_sg_list_screen');
		classes.push('sys_sg_calendar_screen');
		classes.push('sys_sg_form_screen');
		classes.push('sys_sg_custom_map_screen');
		
		return classes;
	},

	/*
		Returns true if given screen class can be configured as a Parameterized Screen
	*/
	isParameterizedScreenClass: function(className) {
		return this.getParameterizedScreenClasses().indexOf(className) != -1;
	},

	/*
		Returns true if the chosen Input Form Screen cannot be used with a Parameterized Screen
	*/
	isParameterScreenInvalid: function(current) {
		return this.isParameterizedScreenClass(current.getRecordClassName()) &&
				current.parameter_screen.changes() && 
				!current.parameter_screen.nil() && 
				current.parameter_screen.presentation_style == 'screen';
	},

	getAttachmentInputsRefQual: function(current) {
		var attachmentInputsRefQual = 'type=ce1c605517021010f2b43b9fadb9597d';
		var parameterScreenId = null;
		
		if (current.parameter_screen)
			parameterScreenId = current.parameter_screen;
		else if (current.action_item && current.action_item.parameter_screen)
			parameterScreenId = current.action_item.parameter_screen;
		
		if (!parameterScreenId)
			return attachmentInputsRefQual;

		var sections = this.getParameterScreenSections(parameterScreenId);
		var sectionsQuery = sections.length > 0 ? '^ORparameter_sectionIN' + sections : '';
		
		return attachmentInputsRefQual + '^parameter_screen=' + parameterScreenId + sectionsQuery;
	},

	getParameterScreenSections: function(parameterScreenId) {
		var sections = [];
		var paramterSectionM2MGR = new GlideRecord('sys_sg_parameter_section_m2m');
		paramterSectionM2MGR.addQuery('parameter_screen', parameterScreenId);
		paramterSectionM2MGR.addQuery('parameter_section', '!=', '');
		paramterSectionM2MGR.addQuery('active', true);
		paramterSectionM2MGR.query();
		while (paramterSectionM2MGR.next()) {
			sections.push(paramterSectionM2MGR.getValue('parameter_section'));
		}
		
		return sections;
	},
	
	type: 'SGParameterScreenHelper'
};
