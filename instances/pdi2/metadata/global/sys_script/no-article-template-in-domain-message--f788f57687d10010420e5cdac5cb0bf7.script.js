(function executeRule(current, previous /*null when async*/) {

	var table = current.getValue('sys_class_name');
	
	if(table.startsWith('kb_template') || table.startsWith('u_kb_template')){
		var template = new GlideRecord('kb_article_template');
		var templateExists = template.get('child_table',table);
		var templateNotGlobalAndArticleIsGlobal = template.getValue('sys_domain') !== 'global' && current.getValue('sys_domain') == 'global';
		if(!templateExists || templateNotGlobalAndArticleIsGlobal){
			if(gs.hasRole('admin'))
				gs.addInfoMessage(gs.getMessage('A knowledge article created using this article template might not be visible to all users because the template is in a different domain.'));
			else
				gs.addInfoMessage(gs.getMessage('A knowledge article created using this article template might not be visible to all users. To make article visible to all users, contact your administrator.'));
		}
	}

})(current, previous);
