var PlaybookDynamicContentType = Class.create();

PlaybookDynamicContentType.prototype = {

    initialize: function() {},

    MODEL_ID: 'c0e6a71443923110f6669c7385b8f20a',

    /* returns the url of the dynamic content item */
    getURL: function(content, uiType) {
		var page = content.page || 'playbook';
		var sysId = content.parent_sysid || '-1';
		var query = content.query;
		var table = content.table;
		var playbookExperienceId = content.playbook_experience;
		var title = content.title;
		// for jelly page the uiType is platform
		var urlPrefix = uiType && uiType === 'platform' ? '/sp' : '';    

		var url = urlPrefix + '?sys_id='+ sysId + 
				'&id=' + page + 
				'&table=' + table +
				'&spa=1';
	
		if (query) url += "&query=recordGeneratorId=" + query;

		if (playbookExperienceId) url += "&playbookExperienceId=" + playbookExperienceId;

		if (title) url += "&title=" + title;

		return url;
    },

    /* returns true if the content is accessible to user*/
    canView: function(content) {
        return true;
    },

    /* returns the portal configuration for dynamic item */
    getServicePortalConfig: function(content) {

		var config = {
			id: content.page || 'playbook',
			table: content.table,
			sys_id: content.parent_sysid || -1,
			spa: 1 // Option to stop Playbook Portal from refreshing the iframe twice after record generator
		};

		var playbookExperienceId = content.playbook_experience;
		var title = content.title;
		var query = content.query;

		if(query) config.query = 'recordGeneratorId='+query;
		
		if(playbookExperienceId) config.playbookExperienceId = playbookExperienceId;

		if(title) config.title = title;
        
		return config;
    },

    type: 'PlaybookDynamicContentType'
};
