var ServiceMappingAjaxUtils = Class.create();
ServiceMappingAjaxUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getMappingLevelForServiceTable: function() {
        var rec = new GlideRecord('service_table_config');
        rec.addQuery('service_table', this.getParameter('sysparm_service_table'));
        rec.query();

        if (rec.next()) {
            return rec.getValue("mapping_level");
        }

        return "";
    },

    type: 'ServiceMappingAjaxUtils'
});
