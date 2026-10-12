var InteractiveFilterUtils = Class.create();
InteractiveFilterUtils.prototype = {
    initialize: function() {
    },

	_getLabel: function(value, language) {
		var gr = new GlideRecord('sys_choice');
		gr.addQuery('name', 'sys_ui_hp_publisher');
		gr.addQuery('element', 'ui_control_type');
		gr.addQuery('value', value);
		gr.addQuery('language', language);
		gr.query();

		if (gr.next())
			return gr.getValue('label');

		return '';
	},

	_getLanguage: function() {
		var language = gs.getUser().getLanguage();
		return language ? language : 'en';
	},

	generateUIControlTypeChoices: function() {
		var filterBasedOn = GlideController.getGlobal('dependent_value');
		var gcl = new GlideChoiceList();
		var language = this._getLanguage();
		gcl.add('1', this._getLabel(1, language));
		gcl.add('3', this._getLabel(3, language));
		gcl.add('2', this._getLabel(2, language));
		gcl.add('4', this._getLabel(4, language));

		if (filterBasedOn == '5') { // Boolean
			gcl.removeChoice('3');
			gcl.removeChoice('4');
		}

		return gcl;
	},

    type: 'InteractiveFilterUtils'
};
