var BusinessProcessUtilBase = Class.create();
BusinessProcessUtilBase.prototype = {
    initialize: function() {},

	canShowApproveOrRejectButton: function(businessProcess) {
		return this._canShowApproveOrRejectButton(businessProcess);
	},
	
    getChildren: function(businessProcess) {
        var children = [businessProcess.getUniqueValue()];
        this._getChildren(children, children);
        return children;
    },

    _getChildren: function(allChildren, currentLevel) {

        if (currentLevel.length == 0) return;

        var gr = new GlideRecord('cmdb_ci_business_process');
        gr.addQuery('parent', 'IN', currentLevel);
        gr.query();

        var nextLevel = [];
        while (gr.next()) {
            allChildren.push(gr.getUniqueValue());
            nextLevel.push(gr.getUniqueValue());
        }

        this._getChildren(allChildren, nextLevel);
    },

    canAccess: function(businessProcess) {
        if (gs.hasRole('business_process_manager') || gs.hasRole('itil') || gs.hasRole('asset')) {
            return true;
        } else {
            var gr = new GlideRecord('cmdb_ci_business_process');
            gr.addQuery('sys_id', businessProcess.getUniqueValue());
            gr.addEncodedQuery('owned_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORmanaged_by_groupDYNAMICd6435e965f510100a9ad2572f2b47744');
            gr.setLimit(1);
            gr.query();
            return gr.hasNext();
        }
    },

    syncRelations: function(current) {
        var dependsOnRel = gs.getProperty('cmdb.depends_constant');
        var m2m = new GlideRecord('cmdb_m2m_business_process_ci');
        /** Below code will add the entries in business process to ci table if there is new relation created in cmdb_rel_ci***/
        var gr = new GlideRecord('cmdb_rel_ci');
        gr.addQuery('parent.sys_class_name', 'cmdb_ci_business_process');

        if (current) {
            gr.addQuery('parent', current.getUniqueValue());
        }

        gr.addQuery('type', dependsOnRel);
        gr.query();

        while (gr.next()) {

            m2m.initialize();
            m2m.addQuery('business_process', gr.getValue('parent'));
            m2m.addQuery('cmdb_ci', gr.getValue('child'));
            m2m.setLimit(1);
            m2m.query();
            if (!m2m.hasNext()) {
                m2m.initialize();
                m2m.setValue('business_process', gr.getValue('parent'));
                m2m.setValue('cmdb_ci', gr.getValue('child'));
                m2m.setWorkflow(false);
                m2m.insert();
            }
        }

        /** Below code will delete if there are stale relationshiops in business process to CI. i.e, relationship deleted in cmdb_rel_ci**/

        m2m.initialize();
        if (current)
            m2m.addQuery('business_process', current.getUniqueValue());
        m2m.query();
        while (m2m.next()) {
            gr.initialize();
            gr.addQuery('parent', m2m.getValue('business_process'));
            gr.addQuery('child', m2m.getValue('cmdb_ci'));
            gr.addQuery('type', dependsOnRel);
            gr.setLimit(1);
			gr.query();
            if (!gr.next()) {
                m2m.setWorkflow(false);
                m2m.deleteRecord();
            }
        }
		
		if(gs.isInteractive()){
			gs.addInfoMessage(gs.getMessage('Related Assets have been refreshed with Related Items'));
		}
    },

	_canShowApproveOrRejectButton: function(businessProcess) {
		var approver = new GlideRecord('sysapproval_approver');
		approver.addEncodedQuery('source_table=cmdb_ci_business_process^document_id=' + businessProcess + '^approver=' + gs.getUser().getID() + '^state=requested');
		approver.setLimit(1);
		approver.query();
		return approver.hasNext();
	},
	
    type: 'BusinessProcessUtilBase'
};
