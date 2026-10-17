var RelatedListCIAssetCandidateFilter = Class.create();
RelatedListCIAssetCandidateFilter.prototype = {
    initialize: function(tableName, parentFieldName, parentRecordSysId, referencedFieldName) {
        this.parentRecordSysId = parentRecordSysId;
    },

    getFilterQuery: function() {
		var ciSysId = [];
		var gr = new GlideRecordSecure("task_ci");
		gr.addUserEncodedQuery("ci_item.assetISNOTEMPTY^task="+this.parentRecordSysId);
		gr.query();
		while(gr.next()) {
			ciSysId.push(gr.ci_item + '');
		}
        return "assetISNOTEMPTY^sys_idNOT IN"+ciSysId.join();
    },

    handles: function(thing) {
        return thing == "ASSET_QUERY_FILTER";
    },

    type: 'RelatedListCIAssetCandidateFilter'
};
