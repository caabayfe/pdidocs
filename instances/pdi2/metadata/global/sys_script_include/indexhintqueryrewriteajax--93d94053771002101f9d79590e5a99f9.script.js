var IndexHintQueryRewriteAjax = Class.create();
IndexHintQueryRewriteAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isPgHintSupported: function() {
		var table = this.getParameter('sysparm_table');
		
		return SNC.IndexHintQueryRewriteAjax.isPgHintSupported(table);
	},
	getIndexHintForTableAndColumns: function() {
		var table = this.getParameter('sysparm_table');
		var correlationName = this.getParameter('sysparm_correlationName');
		var hintType = this.getParameter('sysparm_hintType');
		var indexColumns = this.getParameter('sysparm_indexColumns');
		var engine = this.getParameter('sysparm_engine');
		var changeNumber = this.getParameter('sysparm_changeNumber');
		
		return SNC.IndexHintQueryRewriteAjax.getIndexHintForTableAndColumns(table, correlationName, hintType, indexColumns, engine, changeNumber);
	},

    type: 'IndexHintQueryRewriteAjax'
});
