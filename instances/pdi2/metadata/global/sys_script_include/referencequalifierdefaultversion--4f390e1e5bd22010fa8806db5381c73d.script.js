var ReferenceQualifierDefaultVersion = Class.create();
ReferenceQualifierDefaultVersion.prototype = {
    initialize: function() {
    },
    getDocumentVersions: function(current) {
		var gp = [];
		var gr = new GlideRecord('ds_document_version');
		gr.addQuery('document', current.sys_id);
		gr.query();
		while (gr.next()) {
			gp.push(gr.getUniqueValue());
		}
		return 'sys_idIN' + gp.join(',');
	},
    type: 'ReferenceQualifierDefaultVersion'
};
