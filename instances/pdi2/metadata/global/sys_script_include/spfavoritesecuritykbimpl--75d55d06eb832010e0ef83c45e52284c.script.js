var SPFavoriteSecurityKBImpl = Class.create();
SPFavoriteSecurityKBImpl.prototype = {
    initialize: function() {
    },
	
	/* return if the record is visible in the protal */
    canView: function(/*GlideRecord*/ gr, /*SysID*/portalID) {
		var knowledgeBases = new GlideSPScriptable(portalID).getKnowledgeBases();
		return (knowledgeBases.indexOf(gr.getValue('kb_knowledge_base')) > - 1);
    },
	
	/* return true if this extension point is to be run */
	applies: function(/*GlideRecord*/ gr) {
		return gr.getTableName() == 'kb_knowledge';
	},

    type: 'SPFavoriteSecurityKBImpl'
};
