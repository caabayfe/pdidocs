var UXFSnapshotHelper = Class.create();
UXFSnapshotHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        var name = this.getParameter('sysparm_name');
        if (name == 'getUXFComponentsFromSnapshot')
            return JSON.stringify(this.getUXFComponentsFromSnapshot(this.getParameter('sysparm_test_id'),
                this.getParameter('sysparm_step_order'), this.getParameter('sysparm_methods')));
        if (name == 'findUXFSnapshot')
            return JSON.stringify(this.findUXFSnapshot(this.getParameter('sysparm_test_id'),
                this.getParameter('sysparm_step_order')));
        if (name == 'getActionsForComponent')
            return JSON.stringify(this.getActionsForComponent(this.getParameter('sysparm_componentSysId')));
    },

	// To be used with the "Edit page interaction" UI action on existing Test Page steps
	shouldShowEditButton: function(stepGR) {
		if (!stepGR || !stepGR.isValidRecord())
			return false;

		var TEST_PAGE_SYS_ID = '33bb3cb343810210285ffa73cbb8f245';

		if(!((new GlideImpersonate()).isImpersonating()) && sn_atf.AutomatedTestingFramework.isRunnerEnabled()
			&& GlideMobileExtensions.getDeviceType() == 'doctype' && stepGR.test.active && stepGR.active
			&& stepGR.getValue("step_config") === TEST_PAGE_SYS_ID)
			return true;

		return false;
	},

    /** Given a test sys_id and step order, finds the relevant snapshot and returns all components in it (in a format digestible by select2) */
    getUXFComponentsFromSnapshot: function(testSysId, stepOrder, methods) {
        var uiComponents = {};
        var snapshotId = this.findUXFSnapshot(testSysId, stepOrder);
        if (snapshotId) {
            var componentsByType = new UxFrameworkScriptables().getUXFSeismicComponents(snapshotId);
            uiComponents['children'] = componentsByType;
        }

        var results = [];
        results.push(uiComponents);

        var components = {};
        components['results'] = results;
        return components;
    },

    /** Given a test sys_id and step order, finds the relevant snapshot and returns all seismic components in it as a choice list */
    getUXFSeismicComponentsFromSnapshotAsChoiceList: function(currentStepGR) {
        var components;
        var snapshotId = this.findUXFSnapshot(currentStepGR.test, currentStepGR.order);
        if (snapshotId) {
            components = new UxFrameworkScriptables().getUXFSeismicComponents(snapshotId);
        }

        var componentChoiceList = new GlideChoiceList();
        for (var i = 0; i < components.length; i += 1) {
            var component = components[i];
            // component.id is the locator here (it has to be 'id' for select2 to work correctly)
            componentChoiceList.add(new GlideChoice(component.id, ' ()' + component.parent_macroponent + ')'));
        }

        return componentChoiceList;
    },

    findUXFSnapshot: function(testSysId, stepOrder) {
        return new UxFrameworkScriptables().findUXFSnapshot(testSysId, stepOrder);
    },

    getActionsForComponent: function(componentSysId) {
		return new UxFrameworkScriptables().getAvailableActions(componentSysId);
    },

    type: 'UXFSnapshotHelper'
});
