var InteractionRelationshipUtil = Class.create();
InteractionRelationshipUtil.prototype = {

	TABLES: {
		'INTERACTION': 'interaction'
	},

    initialize: function() {
	},

	linkToParentInteraction: function(current, operation) {
		var parentInteractionSysId = this.getParentInteractionSysId();
		if (parentInteractionSysId && parentInteractionSysId != '') {
			sn_interaction.RelatedRecord.createOrUpdate(
				parentInteractionSysId, current.getRecordClassName(), current.getUniqueValue(), operation);
		}
	},

	/**
	 * Copy Attachments from an interaction GlideRecord to another GlideRecord
	 * if the current settings allow for it. If an attachment with the source
	 * hash is already on the targetGr, skip it (do not duplicate).
	 *
	 * @param srcGr        {GlideRecord}
	 * @param targetGr     {GlideRecord}
	 */
	copyAttachments: function(srcGr, targetGr) {
		if(!srcGr.isValidRecord())
			return;

		var srcTable = srcGr.getValue('sys_class_name');
		var targetTable = targetGr.getTableName();
		var targetId = targetGr.getValue('sys_id');

		if(srcTable != 'interaction')
			return;
		if (gs.nil(targetId)) {
			// target not ready yet; store in client data and use to
			// copy attachments and set work notes on display
			gs.getSession().putClientData('parent_interaction', srcGr.getValue("sys_id"));
			return;
		}
		if (!(new global.VAGlobalUtil().isAttachmentCopyEnabled(targetTable)))
			return;

		if (!srcGr.canRead()) {
			gs.warn('copyAttachments: User is not authorized to perform this action');
			return;
		}

		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name', srcTable);
		gr.addQuery('table_sys_id', srcGr.getValue('sys_id'));
		gr.query();
		var srcFiles = {};
		while (gr.next()) {
			if (this.shouldCopy(srcGr, gr)) {
				var key = gr.getValue('file_name') + gr.getValue('hash');
				srcFiles[key] = gr.getValue('sys_id');
			}
		}
		var gr1 = new GlideRecord('sys_attachment');
		gr1.addQuery('table_name', targetTable);
		gr1.addQuery('table_sys_id', targetId);
		gr1.query();
		// will not duplicate the files which have the same name and same content
		while (gr1.next()) {
			var targetKey = gr1.getValue('file_name') + gr1.getValue('hash');
			delete srcFiles[targetKey];
		}
		for (var key1 in srcFiles) {
			sn_cs.VASystemObject.copyAttachment(srcFiles[key1], targetTable, targetId);
		}
	},

	/**
	 * Block copying of attachments that were sent in private messages
	 */
	shouldCopy: function(interactionGr, attachmentGr) {
		if (interactionGr.getValue('channel_metadata_table') != 'sys_cs_conversation')
			return true;

		var mediaGr = new GlideRecord('sys_cs_media');
		mediaGr.addQuery('conversation', interactionGr.getValue('channel_metadata_document'));
		mediaGr.addQuery('sys_attachment_id', attachmentGr.getUniqueValue());
		mediaGr.addQuery('is_private', true);
		mediaGr.query();
		return !mediaGr.hasNext();
	},

	/**
	 * Utility to fetch sys_id of parent interaction record by using URL in request
	 */
	getParentInteractionSysId: function(){
		var txn = GlideTransaction.get();
		if (!txn)
			return;
		var request = txn.getRequest();
		if (!request)
			return;

		// if triggered by a UI action, the parent interaction sys ID should be in the sysparm_sys_id request parameter
		var uri = request.getRequestURI();
		if (!GlideStringUtil.nil(uri) && uri.includes('/ui_action/') && request.getParameter('sysparm_table') == 'interaction')
			return request.getParameter('sysparm_sys_id')

		// in other scenarios, make try extracting the interaction from the referer URL
		var referer = request.getHeader("Referer");

		// specifically exclude hr workspace to prevent breaking their downstream code
		if (GlideStringUtil.nil(referer) || referer.includes('/now/workspace/hr/') || referer.includes('/now/hr/'))
			return;
		var matches = referer.match(/\/(agent|sow)\/(chat|record\/interaction)\/([0-9a-f]{32})/);
		if (!matches || matches.length < 4)
			return;
		return matches[3];
	},

    type: 'InteractionRelationshipUtil'
};
