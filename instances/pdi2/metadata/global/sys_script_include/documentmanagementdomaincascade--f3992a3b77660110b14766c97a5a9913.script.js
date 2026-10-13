var DocumentManagementDomainCascade = Class.create();
DocumentManagementDomainCascade.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    updateTableDomain: function(tableName, fieldName, sysId, domain) {
        var tableGR = new GlideMultipleUpdate(tableName);
        tableGR.addQuery(fieldName, sysId);
        tableGR.setValue('sys_domain', domain);
        tableGR.execute();
    }
});
