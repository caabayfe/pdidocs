var MigrateToActionGroupM2M = Class.create();

MigrateToActionGroupM2M.prototype = {

    migrateActions: function(current) {
        var actionGr = new GlideRecordSecure("sys_ux_form_action");
        actionGr.addQuery("sys_id", "IN", current.actions.getValue());
        actionGr.query();
        while (actionGr.next()) {
            var m2mGr = new GlideRecord("sys_ux_m2m_action_layout_group_action");
            m2mGr.initialize();
            m2mGr.label = actionGr.getDisplayValue();
            m2mGr.action = actionGr.sys_id;
            m2mGr.group = current.sys_id;
            m2mGr.active = actionGr.active;
            if (actionGr.getValue("action_type") == "ui_action") {
                m2mGr.order = actionGr.ui_action.order;
            } else {
                m2mGr.order = actionGr.declarative_action.order;
            }
            m2mGr.insert();
        }
        current.actions = null;
        current.use_m2m = true;
        current.update();
    },

    type: 'MigrateToActionGroupM2M'

};
