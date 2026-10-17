(function executeRule(current, previous /*null when async*/) {
	var selectedGroups = [];
	var currentGroup = current.escalation_set.cmn_rota.group + '';
	
	if (current.sys_user_groups) {
		selectedGroups = current.sys_user_groups.split(',');
	}
	
	if (selectedGroups.indexOf(currentGroup) != -1) {
		var msg = gs.getMessage('Escalation set "{0}" is defined on "{1}" group, So you cannot have same group as the dependency', [current.escalation_set.getDisplayValue(), current.escalation_set.cmn_rota.group.getDisplayValue()]);
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
		return;
	}
	
	var depth = 0;
	var groupWithDepthMoreThan2 = '';
	var groups = [];
	for (var i = 0; i < selectedGroups.length; i++) {
		var group = {};
		if (selectedGroups[i]) {
			group.value = selectedGroups[i];
			group.parent = currentGroup;
			group.path = group.parent + '.' + group.value;
			groups.push(group);
		}
	}
	
	var hasCyclicDependency = checkIfCyclicDependent(groups);
	if (hasCyclicDependency)
		return;
	
	if (depth > 2) {
		var groupName = '';
		groupWithDepthMoreThan2 = groupWithDepthMoreThan2.split('.');
		groupWithDepthMoreThan2 = groupWithDepthMoreThan2[1];
		var groupGr = new GlideRecord('sys_user_group');
		if (groupGr.get(groupWithDepthMoreThan2)) {
			groupName = groupGr.getDisplayValue();
		}
		var infoMessage = gs.getMessage('The Group "{0}" refers more groups for its escalation path and goes on. Review desired escalation path', [current.escalation_set.cmn_rota.group.getDisplayValue()]);
		gs.addInfoMessage(infoMessage);
		var infoMessage1 = gs.getMessage('Here "{0}" is the group which has more than 2 depth', [groupName]);
		gs.addInfoMessage(infoMessage1);
	}
	
	var stepReferringThisGroup = getAnyStepReferringThisGroup();
	if (stepReferringThisGroup.isReferred) {
		var referringMessage = gs.getMessage('Escalation step "{0}" has dependency on "{1}" group', [stepReferringThisGroup.escalationStepGr.getDisplayValue(), current.escalation_set.cmn_rota.group.getDisplayValue()]);
		gs.addInfoMessage(referringMessage);
	}
	
	/*START: Functions*/
	function checkIfCyclicDependent(groups) {
		var allDependentGroupsAtThisDepth = [];
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			group.depth = depth;
			if (!groupWithDepthMoreThan2 && group.depth >= 2)
				groupWithDepthMoreThan2 = group.path;
			var dependentGroups = [];
			var dependentGroupsSysIds = getDependencyGroups(group.value);

			for (var j = 0; j < dependentGroupsSysIds.length; j++) {
				var dependentGroup = {};
				dependentGroup.value = dependentGroupsSysIds[j];
				dependentGroup.parent = group.parent + '.' + group.value;
				dependentGroup.path = dependentGroup.parent + '.' + dependentGroup.value;
				group[dependentGroup.value] = dependentGroup;
				dependentGroups.push(dependentGroup);
				
				if (dependentGroup.value == currentGroup) {
					var cyclicGroupList = dependentGroup.path.split('.');
					cyclicGroupList.shift();
					var groupsMAp = {};
					
					var groupsGr = new GlideRecord('sys_user_group');
					groupsGr.addQuery('sys_id', 'IN', cyclicGroupList.join(','));
					groupsGr.query();
					while (groupsGr.next()) {
						groupsMAp[groupsGr.getUniqueValue()] = groupsGr.getDisplayValue();
					}
					
					var groupsCycle = '';
					for (var k = 0; k < cyclicGroupList.length; k++) {
						if (k == cyclicGroupList.length - 1)
							groupsCycle += groupsMAp[cyclicGroupList[k]];
						else
							groupsCycle += groupsMAp[cyclicGroupList[k]] + ' => ';
					}
					
					var message = gs.getMessage('This step "{0}" has cyclic dependency with one of the selected groups', [current.name]);
					gs.addErrorMessage(message);
					var message1 = gs.getMessage('Cyclic path: {0}', [groupsCycle]);
					gs.addErrorMessage(message1);
					current.setAbortAction(true);
					return true;
				}
			}
			
			allDependentGroupsAtThisDepth = allDependentGroupsAtThisDepth.concat(dependentGroups);
		}
		depth++;
		if (allDependentGroupsAtThisDepth.length > 0)
			return checkIfCyclicDependent(allDependentGroupsAtThisDepth);
		return false;
	}
	function getDependencyGroups(group) {
		var dependencyGroups = [];
		var escalationStepGr = new GlideRecord('cmn_rota_esc_step_def');
		escalationStepGr.addQuery('escalation_set.cmn_rota.group', group);
		escalationStepGr.addQuery('escalation_set.active', true);
		escalationStepGr.query();
		while (escalationStepGr.next()) {
			if (escalationStepGr.sys_user_groups) {
				dependencyGroups = dependencyGroups.concat(escalationStepGr.sys_user_groups.split(','));
			}
		}
		return dependencyGroups;
	}
	function getAnyStepReferringThisGroup() {
		var result = {
			isReferred : false
		};
		var group = current.escalation_set.cmn_rota.group;
		if (group) {
			var escalationStepGr = new GlideRecord('cmn_rota_esc_step_def');
			escalationStepGr.addQuery('escalation_set.active', true);
			escalationStepGr.addQuery('sys_user_groups', 'CONTAINS', group);
			escalationStepGr.setLimit(1);
			escalationStepGr.query();
			if (escalationStepGr.next()) {
				result.isReferred = true;
				result.escalationStepGr = escalationStepGr;
			}
		}
		return result;
	}
	/*END: Functions*/
})(current, previous);
