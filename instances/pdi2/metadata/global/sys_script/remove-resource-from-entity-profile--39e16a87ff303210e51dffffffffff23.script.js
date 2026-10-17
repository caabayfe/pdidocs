(function executeRule(current, previous /*null when async*/ ) {

    var sysId = current.getUniqueValue();
	
    var gr = new GlideRecord("oauth_entity_profile");
    gr.addQuery('oauth_entity', current.getValue('oauth_entity'));
    gr.addQuery('oauth_resources', 'CONTAINS', sysId);
    gr.query();
    while (gr.next()) {
        var resourcesStr = gr.getValue('oauth_resources') || '';
        var resources = resourcesStr.split(',');
        var index = resources.indexOf(sysId);
        if (index != -1)
            resources.splice(index, 1);
		gr.setValue('oauth_resources', resources.join(','));
		gr.update();
    }
    // Add your code here

})(current, previous);
