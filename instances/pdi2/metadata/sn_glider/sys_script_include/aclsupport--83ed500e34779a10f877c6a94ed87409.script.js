var ACLSupport = Class.create();
ACLSupport.prototype = {
    initialize: function() {
    },
	isSecurityAdmin: function() {
        return gs.hasRole('security_admin') || gs.hasRole('maint');
    },
	canAccessFileIndex: function(uid, uri) {
		return uri.indexOf('settings:/users/') == -1 || uri.indexOf(uid) != -1;
	},
	canAccessFileContent: function(uid, checksum) {
		// Check the file path of this content by querying index
		var gr = new GlideRecord('sn_glider_ide_file_index');
		gr.addQuery('checksum', checksum);
		gr.addQuery('uri', 'STARTSWITH', 'now-file:/')
			.addOrCondition('uri', 'STARTSWITH', 'settings:/users/')
			.addCondition('uri', 'CONTAINS', uid);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
    type: 'ACLSupport'
};
