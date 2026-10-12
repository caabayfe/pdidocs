var ProviderContentTables = Class.create();
ProviderContentTables.prototype = {
    initialize: function() {
    },
	
	process: function() {
		var answer = [];
		var extensions = GlideDBObjectManager.get().getTableExtensions('sys_notification_content');
		for (var i = 0; i < extensions.size(); i++) {
			if (extensions.get(i) == 'sys_notification_actionable_prompt')
				continue;
			
			answer.push(extensions.get(i));
		}
		
		return answer;
    },

    type: 'ProviderContentTables'
};
