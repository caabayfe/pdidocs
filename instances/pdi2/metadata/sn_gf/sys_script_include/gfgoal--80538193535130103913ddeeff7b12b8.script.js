var GFGoal = Class.create();
GFGoal.prototype = Object.extendsObject(GFCoreGoal,{
	getGoalGR: function(goalId){
		if(!this.goalGR){
			this.goalId = goalId;
			this.goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
			this.goalGR.get(this.goalId);
		}
		return this.goalGR;
	},
	
	isValidStrategy: function(){
		var strategy = new GlideRecord(GoalFrameworkConstants.STRATEGY_TABLE);
		//adding valid strategies ref qual as encoded query
		strategy.addEncodedQuery(sn_gf.GFRefQualHelper.getStrategiesForGoal(this.getGoalGR()));
		strategy.addQuery("sys_id",this.getGoalGR().getValue("strategy"));
		strategy.query();
		return strategy.hasNext();
	},

	getAssignedEntityTypes: function(){
		var goalAssignedEntityConfigRec = new GlideRecord(GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
		goalAssignedEntityConfigRec.query();

        var list = new GlideChoiceList();
		while(goalAssignedEntityConfigRec.next()){
		   var entityTableName = goalAssignedEntityConfigRec.getValue('assigned_entity_table');
           var gr = new GlideRecord(entityTableName);
		   if(!gr.isValid()) continue;
           var label = gr.getClassDisplayValue();
		   list.add(new GlideChoice(entityTableName, label));
		}
        return list;
	},

	getAssignedEntityReferenceColumn: function(assignedEntityType){
        var goalAssignedEntityConfigRec = new GlideRecord(GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
		goalAssignedEntityConfigRec.addQuery('assigned_entity_table', assignedEntityType);
		goalAssignedEntityConfigRec.query();

        if(goalAssignedEntityConfigRec.next()){
           return goalAssignedEntityConfigRec.getValue('assigned_entity_field');
		}
        return '';
	},

	getFieldLabel: function(fieldName){
		var gr = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
		if(gr.isValid()){
			var element = gr.getElement(fieldName);
			return element.getLabel();
		}
	},

	getAssignedEntityReferenceFields: function(){
        var goalAssignedEntityConfigRec = new GlideRecord(GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
		goalAssignedEntityConfigRec.query();

        var assingedEntityLists = [];  
        while(goalAssignedEntityConfigRec.next()){
		   	assingedEntityLists.push({
				fieldName: goalAssignedEntityConfigRec.getValue('assigned_entity_field'),
				fieldLabel: this.getFieldLabel(goalAssignedEntityConfigRec.getValue('assigned_entity_field'))
			});
		}
        return assingedEntityLists;
	},

	syncReferenceFieldToAssignedEntityCondition: function() {
        var isPortfolioMgmtInstalled = GlidePluginManager.isActive('com.snc.portfolio_management');
        var isAPWAdvancedInstalled = GlidePluginManager.isActive('sn_apw_advanced');
        return !this.goalGR.assigned_entity.changes() && (this.goalGR.company.changes() ||
            this.goalGR.business_unit.changes() ||
            this.goalGR.department.changes() ||
            (isPortfolioMgmtInstalled && this.goalGR.portfolio.changes()) ||
            (isAPWAdvancedInstalled && this.goalGR.product_model.changes()) ||
            (isAPWAdvancedInstalled && this.goalGR.initiative.changes()) ||
            (isAPWAdvancedInstalled && this.goalGR.strategic_program.changes()) ||
			(isAPWAdvancedInstalled && this.goalGR.value_stream.changes()));
    },

	deleteGoal: function() {
        if (this.goalGR != null && this.goalGR.canDelete()) {
            this.goalGR.deleteRecord();
            this.goalGR = null;
            this.goalId = '';
        }
    },
	
    type: 'GFGoal'
});
