var DiscoverChoiceList = Class.create();
DiscoverChoiceList.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getDefaultValue : function(table) {
		var discoGr = new GlideRecord('sys_choice'); 
		discoGr.addQuery('name', table);
		discoGr.addQuery('element', 'discover');
		discoGr.orderBy('sequence');
		discoGr.setLimit(1);
		discoGr.query();
		if (discoGr.next())
			return discoGr.getValue('value');
	},

	type: 'DiscoverChoiceList'
});
