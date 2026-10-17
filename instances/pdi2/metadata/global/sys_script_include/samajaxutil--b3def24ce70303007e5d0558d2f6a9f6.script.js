var SAMAjaxUtil = Class.create();
SAMAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getPluginInfo : function() {
		var status = new SAMUtils().getPluginStatus(this.getParameter('sysparm_plugin_id'));
		var values = this.newItem("values");
		values.setAttribute("status", status);
	},
	
	getChoiceTranslationLabel : function() {
		var lang = gs.getUser().getLanguage();
		var choiceValue = this.getParameter('sysparm_choice_value');
		var fieldName = this.getParameter('sysparm_field_name');
		var tableName = this.getParameter('sysparm_table_name');

		var choiceLabel;
		var gr = new GlideRecord('sys_choice');
		gr.addQuery('name', tableName);
		gr.addQuery('element', fieldName);
		gr.addQuery('language', lang);
		gr.addQuery('value', choiceValue);
		gr.query();
		if (gr.next()) {
			choiceLabel = gr.getValue('label');
		}
		return choiceLabel;
	},

    type: 'SAMAjaxUtil'
});
