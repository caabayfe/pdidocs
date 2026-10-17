(function(context, pageParams, blockcontext) {
    var days = gs.getProperty('sn_sow_interaction.requester_info_task_query_day_range');
    var closeInteractionProp = gs.getProperty('sn_sow_inc.autoclose_origin.interaction');
    var showInboxCard = false;

    var propertyGR = new GlideRecord('sys_properties');
    propertyGR.addQuery('name', 'sn_sow_itsm_common.auto_hide_inbox');
    propertyGR.query();
    if (propertyGR.next()) {
        showInboxCard = true;
    } else {
        showInboxCard = false;
    }

    var hideInboxProp = gs.getProperty('sn_sow_itsm_common.auto_hide_inbox');

    return {
        days: days,
        closeInteractionProp: closeInteractionProp,
        hideInboxProp: hideInboxProp,
        showInboxCard: showInboxCard
    };
})(context, pageParams, blockcontext);
