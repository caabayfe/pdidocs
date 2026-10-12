var DefaultGraphChecker = Class.create();
DefaultGraphChecker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	canSetDefault : function() {
		var sysId = this.getParameter("sysparm_sysId");
		var scope = this.getParameter("sysparm_scope");
		var gr = new GlideRecordSecure("sys_meta_graph");
		gr.addQuery("sys_id", "!=", sysId);
		gr.addQuery("sys_scope", scope);
		gr.addQuery("default", true);
		gr.query();
		return gr.hasNext();
	},
    type: 'DefaultGraphChecker'
});
