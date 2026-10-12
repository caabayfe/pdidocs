var QueryRewriteAjax = Class.create();
QueryRewriteAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getExampleRewrite: function() {
		var query = this.getParameter('sysparm_query');
		var lookup = this.getParameter('sysparm_lookup');
		var replacement = this.getParameter('sysparm_replacement');
		return SNC.RegexReplacementRewrite.apply(query, lookup, replacement);
	},

    type: 'QueryRewriteAjax'
});
