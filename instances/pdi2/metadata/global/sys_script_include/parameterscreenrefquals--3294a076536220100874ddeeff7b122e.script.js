var ParameterScreenRefQuals = Class.create();
ParameterScreenRefQuals.prototype = {
    forInputPage: function() {
		if (current.parameter_screen == "")
			return "";
		
		else
			return "parameter_screen=" + current.parameter_screen;
	},

	forSectionPage: function() {
		return this.forInputPage();
	},

    type: 'ParameterScreenRefQuals'
};
