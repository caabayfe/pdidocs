var AISSearchSourceAjax = Class.create();
AISSearchSourceAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getSearchSourceTableAndCondition : function(){
		var sysId = this.getParameter('sysparm_sys_id');
		var searchSourceGr = new GlideRecordSecure("ais_search_source");
		if (!searchSourceGr.get(sysId))
			return 'No access to requested search source';

		return JSON.stringify({
			table: searchSourceGr.datasource.source.toString(),
			condition: searchSourceGr.condition.toString()
		});
	},
    type: 'AISSearchSourceAjax'
});
