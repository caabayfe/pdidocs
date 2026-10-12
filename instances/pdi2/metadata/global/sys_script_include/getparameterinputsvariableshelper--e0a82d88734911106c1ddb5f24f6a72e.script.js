var GetParameterInputsVariablesHelper = Class.create();
GetParameterInputsVariablesHelper.prototype = {
    initialize: function() {
    },
	
	getParameterInputsVariablesRefQual: function() {
		var parameterScreenId = current.screen.parameter_screen;
		var screenRefQualStr = "parameter_screen=" + parameterScreenId;
		
		var paramterSectionM2MGR = new GlideRecord("sys_sg_parameter_section_m2m");
		paramterSectionM2MGR.addQuery("parameter_screen", parameterScreenId);
		paramterSectionM2MGR.query();
			
		var parameterSectionsSet = {};
		while (paramterSectionM2MGR.next()) {
			parameterSectionsSet[paramterSectionM2MGR.parameter_section] = true;
		}
			
		var parameterSectionsArray = Object.keys(parameterSectionsSet);
		var parameterSections = parameterSectionsArray.join(',');
		var sectionRefQualStr = "parameter_sectionIN" + parameterSections;
		
		return screenRefQualStr + "^OR" + sectionRefQualStr;		
	},

    type: 'GetParameterInputsVariablesHelper'
};
