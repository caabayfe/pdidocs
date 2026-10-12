(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {

    var isAPWAdvancedInstalled = GlidePluginManager.isActive('sn_apw_advanced');
    var isPortfolioMgmtInstalled = GlidePluginManager.isActive('com.snc.portfolio_management');

    var orgCondition = !gs.nil(source.u_company) || !gs.nil(source.u_business_unit) ||
        !gs.nil(source.u_department) || (isPortfolioMgmtInstalled && !gs.nil(source.u_portfolio)) ||
        (isAPWAdvancedInstalled && !gs.nil(source.u_product_model)) ||
        (isAPWAdvancedInstalled && !gs.nil(source.u_initiative)) ||
        (isAPWAdvancedInstalled && !gs.nil(source.u_strategic_program));
    var assignedEntityCondition = !gs.nil(source.u_assigned_entity_type) && !gs.nil(source.u_assigned_entity);

    if ((assignedEntityCondition && orgCondition) || (orgCondition && assignedEntityCondition)) {
        log.error("Goal " + source.u_name + " import failed: Please provide either 'one of the organization field' or 'Assigned entity type & Assigned entity'");
        ignore = true;
    }

})(source, map, log, target);
