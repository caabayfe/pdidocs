(function executeRule(current, previous /*null when async*/ ) {

    var isAPWAdvancedInstalled = GlidePluginManager.isActive('sn_apw_advanced');
    var isPortfolioMgmtInstalled = GlidePluginManager.isActive('com.snc.portfolio_management');

    var changedEntity = !gs.nil(current.getValue('company')) ? 'company' :
        !gs.nil(current.getValue('business_unit')) ? 'business_unit' :
        !gs.nil(current.getValue('department')) ? 'department' :
        (isPortfolioMgmtInstalled && !gs.nil(current.getValue('portfolio'))) ? 'portfolio' :
        (isAPWAdvancedInstalled && !gs.nil(current.getValue('product_model'))) ? 'product_model' :
        (isAPWAdvancedInstalled && !gs.nil(current.getValue('initiative'))) ? 'initiative' :
        (isAPWAdvancedInstalled && !gs.nil(current.getValue('strategic_program'))) ? 'strategic_program' :
		(isAPWAdvancedInstalled && !gs.nil(current.getValue('value_stream'))) ? 'value_stream' : '';

    var prevReferenceField = new sn_gf.GFGoal().getAssignedEntityReferenceColumn(previous.getValue('assigned_entity_type'));
    if (!gs.nil(prevReferenceField) && changedEntity != prevReferenceField)
        current.setValue(prevReferenceField, '');
	
	let assignedEntityType = sn_gf.GFGoalAssignedEntityConfigSNC.getAssignedEntityTableFromField(changedEntity);
	if(gs.nil(changedEntity)) { // Reference field was cleared off
		current.setValue('assigned_entity_type', '');
		current.setValue('assigned_entity', '');
	}	
	else if(global.JSUtil.notNil(assignedEntityType) && current.getValue(changedEntity) != current.getValue('assigned_entity')) {
		current.setValue('assigned_entity_type', assignedEntityType);
		current.setValue('assigned_entity', current.getValue(changedEntity));
	}

})(current, previous);
