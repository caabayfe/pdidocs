var ACEAppContextUtil = Class.create();
ACEAppContextUtil.prototype = {
    initialize: function() {
        this.CONSTANTS = new ACEAppBuilderMetaData();
        this.TABLE = this.CONSTANTS.TABLES;
    },
    getContentBlockContext: function(contentBlockId) {
        if (!contentBlockId) {
            gs.error('ACEAppContextUtil: contentBlockId is mandatory for fetching context of a content block.');
            return null;
        }
        try {
            var getCBContextGr = new GlideRecord(this.TABLE.CONTENT_BLOCK_CONTEXT);
            getCBContextGr.addQuery('content_block_id', contentBlockId);
            getCBContextGr.setLimit(1);
            getCBContextGr.query();
            if (getCBContextGr.next() && getCBContextGr.canRead()) {
                return JSON.parse(getCBContextGr.getValue('context_payload'));
            }
        } catch (err) {
            gs.error("ACEAppContextUtil: error in fetching record from sn_ace_content_block_context for: " + contentBlockId + " - " + err.toString());
        }
        return null;
    },

    setContentBlockContext: function(contentBlockId, context) {
        if (!contentBlockId) {
            gs.warn('ACEAppContextUtil: contentBlockId is mandatory for setting context of a content block');
            return false;
        }
        if (context === undefined) return false;
        if (!context) context = {};
        if (Object.prototype.toString.call(context) !== "[object String]") {
            context = JSON.stringify(context);
        }
        try {
            var cbContextGr = new GlideRecord(this.TABLE.CONTENT_BLOCK_CONTEXT);
            cbContextGr.addQuery('content_block_id', contentBlockId);
            cbContextGr.setLimit(1);
            cbContextGr.query();
            if (cbContextGr.next() && cbContextGr.canWrite()) {
                cbContextGr.setValue('context_payload', context);
                return cbContextGr.update() ? true : false;
            } else {
                var createCBContextGr = new GlideRecord(this.TABLE.CONTENT_BLOCK_CONTEXT);
                if (!createCBContextGr.canCreate()) return false;
                createCBContextGr.initialize();
                createCBContextGr.setValue('content_block_id', contentBlockId);
                createCBContextGr.setValue('context_payload', context);
                return createCBContextGr.insert() ? true : false;
            }
        } catch (err) {
            gs.error("ACEAppContextUtil: Error in setting the context for the content block '{0}'. with the context details '{1}'", content_block_id, context + err.toString());
        }
        return false;
    },
    type: 'ACEAppContextUtil'
};
