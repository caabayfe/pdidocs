var ServiceAutoDescendants = Class.create();
ServiceAutoDescendants.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getServiceAutoDescendants: function() {
        var hierarchy = new GlideTableHierarchy("cmdb_ci_service_auto");
        var descendants = hierarchy.getAllExtensions();
		return JSON.stringify(descendants);
    }
});
