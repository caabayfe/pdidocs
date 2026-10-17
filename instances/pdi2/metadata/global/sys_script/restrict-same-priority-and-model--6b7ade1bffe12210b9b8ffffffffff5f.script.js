(function executeRule(current, previous /*null when async*/ ) {
    if (current.configuration_order.nil() || current.cmdb_model_category.nil()) {
        return;
    }

    var dupGR = new GlideRecord('product_instance_identifier_configuration');
    dupGR.addQuery('configuration_order', current.configuration_order);
    dupGR.addQuery('cmdb_model_category', current.cmdb_model_category);
    dupGR.addQuery('sys_id', '!=', current.sys_id);
    dupGR.setLimit(1);

    dupGR.query();

    if (dupGR.hasNext()) {
        gs.addErrorMessage(gs.getMessage('A record with the same Configuration Order and CMDB Model Category already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
