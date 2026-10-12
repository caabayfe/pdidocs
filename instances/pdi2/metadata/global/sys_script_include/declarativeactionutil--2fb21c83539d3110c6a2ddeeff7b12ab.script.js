var DeclarativeActionUtil = Class.create();

DeclarativeActionUtil.prototype = {

    SYS_UX_FORM_ACTION: 'sys_ux_form_action',
    SYS_UX_FORM_ACTION_LAYOUT_ITEM: 'sys_ux_form_action_layout_item',
    SYS_UX_M2M_ACTION_LAYOUT_ITEM: 'sys_ux_m2m_action_layout_item',
    UX_FORM_ACTION_LAYOUT_ITEM: 'ux_form_action_layout_item',
    UX_FORM_ACTION_LAYOUT: 'ux_form_action_layout',

    initialize: function() {},

	// Given a DA sysId, return the associated UX Form Action
    getUxFormAction: function(daSysId) {
        var uxFormActionGr = new GlideRecord(this.SYS_UX_FORM_ACTION);
        uxFormActionGr.addQuery('declarative_action.sys_id', daSysId);
        uxFormActionGr.query();

        if (uxFormActionGr.next()) {
            return uxFormActionGr;
        }
    },

	// Given a UX Form Action sysId, return the associated layout items
    getLayoutItems: function(uxLayoutItemGr, uxFormActionSysId) {
        return uxLayoutItemGr
            .addQuery('action', "=", uxFormActionSysId)
            .addOrCondition('layout_group.actions', "CONTAINS", uxFormActionSysId);
    },

	// Given a UX Form Action sysId, return the associated action layouts
    getActionLayouts: function(uxActionLayoutGr, uxFormActionSysId) {
        var layoutItemSysIds = [];

        // Find the layout items associated to the DA
        var actionLayoutItemGr = new GlideRecord(this.SYS_UX_FORM_ACTION_LAYOUT_ITEM);

        this.getLayoutItems(actionLayoutItemGr, uxFormActionSysId);
        actionLayoutItemGr.query();

        while (actionLayoutItemGr.next()) {
            layoutItemSysIds.push(actionLayoutItemGr.getUniqueValue());
        }

		// Find the associated action layouts for the layout items found
        uxActionLayoutGr.addJoinQuery(this.SYS_UX_M2M_ACTION_LAYOUT_ITEM, "sys_id", this.UX_FORM_ACTION_LAYOUT)
            .addCondition(this.UX_FORM_ACTION_LAYOUT_ITEM, "IN", layoutItemSysIds.join(","));

		return uxActionLayoutGr;
    },

    type: 'DeclarativeActionUtil'
};
