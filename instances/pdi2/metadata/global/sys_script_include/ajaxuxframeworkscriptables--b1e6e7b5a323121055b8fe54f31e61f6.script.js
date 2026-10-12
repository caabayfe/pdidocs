var AJAXUxFrameworkScriptables = Class.create();
AJAXUxFrameworkScriptables.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isCBComponent : function() {
		var sysid = this.getParameter("sysparm_id");
		return UxFrameworkScriptables.isCBComponent(sysid);
	}
});
