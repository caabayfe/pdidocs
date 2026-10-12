var ApprovalConfigurationUtil = Class.create();
ApprovalConfigurationUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getValidatedFieldsFromDefaults: function() {
        var tableName = this.getParameter('sysparm_tableName');
        var fieldsList = this.getParameter('sysparm_fieldsList');

        var tableHierarchy = new GlideTableHierarchy(tableName).getHierarchy();
        var validFields = [];

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('name', 'IN', tableHierarchy.join(','));
        gr.addQuery('element', 'IN', fieldsList);
        gr.query();

        while (gr.next()) {
            validFields.push(gr.element.toString());
        }

        return validFields.join(',');

    },
	hasShortDescriptionField: function() {
        var tableName = this.getParameter('sysparm_tableName');
        var tableHierarchy = new GlideTableHierarchy(tableName).getHierarchy();

        var gr = new GlideRecordSecure('sys_dictionary');
        gr.addQuery('name', 'IN', tableHierarchy.join(','));
        gr.addQuery('element', 'short_description');
        gr.query();

        return gr.hasNext();
    },
    type: 'ApprovalConfigurationUtil'
});
