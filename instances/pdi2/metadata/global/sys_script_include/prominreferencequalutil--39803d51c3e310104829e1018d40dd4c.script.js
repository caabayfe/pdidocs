var ProminReferenceQualUtil = Class.create();
ProminReferenceQualUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    validateProjectDefsForScheduledJob: function() {
        var scheduledDefs = [];
        var grJobModelDef = new GlideAggregate('promin_job_m2m_project');
        grJobModelDef.addAggregate('COUNT', 'project');
        grJobModelDef.queryNoDomain();
        while (grJobModelDef.next()) {
            scheduledDefs.push(grJobModelDef.getValue('project'));
        }
        return "content_pack=null^ORcontent_pack=false^pa_uuidISEMPTY^is_template=false^sys_idNOT IN" + scheduledDefs.toString();
    },

    getDynamicQueryForExternalDataSet: function(grProjectEntity) {
        var encodedQuery = "status=READY^";
        if (!gs.nil(grProjectEntity.sys_updated_by)) { // new model def
            encodedQuery += "case_table=" + grProjectEntity.table;
        } else {
            encodedQuery += "case_tableISNOTEMPTY";
        }
        return encodedQuery;
    },

    getQueryForSourceCondition: function(findingRule) {
        var type = findingRule.finding_def.type.getValue();
        if (type == "PROCESS") {
            return "table=" + findingRule.finding_def.process_def.table.getValue();
        } else if (type == "PROJECT") {
            return "table=" + findingRule.source_entity.table.getValue();
        }
        return "table=NO_TABLES";
    },

    getQueryForSinkCondition: function(findingRule) {
        var type = findingRule.finding_def.type.getValue();
        if (type == "PROCESS") {
            return "table=" + findingRule.finding_def.process_def.table.getValue();
        } else if (type == "PROJECT") {
            return "table=" + findingRule.sink_entity.table.getValue();
        }
        return "table=NO_TABLES";
    },

    getQueryForSourceConditionTableConfig: function(findingRule) { // used in promin_finding_def_rule table
        var projectId = findingRule.finding_def.project.getValue();
        return 'project=' + projectId;
    },

    getQueryForSinkConditionTableConfig: function(findingRule) { // used in promin_finding_md_rule table
        var projectId = findingRule.finding_def.project.getValue();
        return 'project=' + projectId;
    },

    getQueryForLinkProject: function(entity) {
        return "project=" + entity.getValue('project') + "^sys_id!=" + entity.getUniqueValue();
    },

    getQueryToListOnlyPOprojects: function() { // used in promin_finding_def table for project field
        return 'is_template=false^pa_uuidISEMPTY';
    },

    getQueryForConstraintStartCondition: function(findingConstraint) { // used in promin_finding_def_constraint table for start condition
        var possibleStartConditions = [];
        var grRule = new GlideRecord('promin_finding_def_rule');
        grRule.addQuery('finding_chain', findingConstraint.finding_chain);
        grRule.query();
        while (grRule.next()) {
            possibleStartConditions.push(grRule.source_condition.toString());
        }
        return 'finding_def=' + findingConstraint.finding_def + "^sys_idIN" + possibleStartConditions.toString();

    },
    getQueryForConstraintEndCondition: function(findingConstraint) { // used in promin_finding_def_constraint table for end condition
        var possibleEndConditions = [];
        var grRule = new GlideRecord('promin_finding_def_rule');
        grRule.addQuery('finding_chain', findingConstraint.finding_chain);
        grRule.query();
        while (grRule.next()) {
            possibleEndConditions.push(grRule.sink_condition.toString());
        }
        return 'finding_def=' + findingConstraint.finding_def + "^sys_idIN" + possibleEndConditions.toString();

    },
    getQueryForConditionTableConfig: function(findingCondition) {
		if(!gs.nil(findingCondition.finding_def)){
            return "project=" + findingCondition.finding_def.project;
		} else {
			return '';
		}
       
    },

    getQueryForRuleStartOrEndCondition: function(findingRule) {
        return "finding_defISNOTEMPTY^finding_def=" + findingRule.finding_def + "^type!=CONTEXT";
    },

    getQueryForContextualCondition: function(findingCondition) {
        return "finding_def=" + findingCondition.finding_def + "^type=CONTEXT^table=" + findingCondition.table;
    },

    getQueryForLeftOrRightConditions: function(findingCondition) {
        var topLevelConditions = [];
        var grRule = new GlideRecord("promin_finding_def_rule");
        grRule.addQuery('finding_def', findingCondition.finding_def);
        grRule.query();
        while (grRule.next()) {
            topLevelConditions.push(grRule.source_condition.toString());
            topLevelConditions.push(grRule.sink_condition.toString());
        }
        var refQual = "finding_def=" + findingCondition.finding_def + "^table=" + findingCondition.table + "^type=" + findingCondition.type;
        return !topLevelConditions ? refQual : refQual + "^sys_idNOT IN" + topLevelConditions.toString();
    },

    getQueryForEntityAttached: function(activityDefGr) {
        var type = activityDefGr.type;
        var currentEntity = activityDefGr.entity;
        var validEntityIds = [];
        if (type == "CHILD_ATTACHED") {
            //get Valid children entities
			validEntityIds = this._getValidChildrenEntitiesAttachable(activityDefGr.entity.project, currentEntity);
        } else if (type == "PARENT_ATTACHED" && currentEntity.relation_type == "REFERENCE") {
            //only parent reference entity is valid
            validEntityIds.push(currentEntity.parent_entity.getValue('sys_id').toString());
        }
        return "sys_idIN" + validEntityIds.toString();
    },
	isChildAttachedApplicable: function() {
		var validEntities = this._getValidChildrenEntitiesAttachable(this.getParameter("sysparm_project_id"), this.getParameter("sysparm_entity_id"));
		if(validEntities) {
			return true;
		}
		return false;
	},
	_getValidChildrenEntitiesAttachable: function(projectId, entityId) {
		var validChildrenAttachable = [];
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery('project', projectId);
        grEntity.addQuery('parent_entity', entityId);
        grEntity.addQuery('relation_type', 'CHILD');
        grEntity.query();
        while (grEntity.next()) {
            validChildrenAttachable.push(grEntity.getUniqueValue().toString());
        }
		return validChildrenAttachable;
    },
    type: 'ProminReferenceQualUtil'
});
