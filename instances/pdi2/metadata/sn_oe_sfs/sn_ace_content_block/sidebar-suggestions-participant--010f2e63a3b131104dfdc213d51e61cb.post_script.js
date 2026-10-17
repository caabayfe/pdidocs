(function(context, pageParams, blockcontext, dataParams){
    var availableResult = {}, groups = {}, selectedGroupsResult = [];
    var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';

    var configGR = new GlideRecord('sys_cs_collab_participant_suggestions_config');
    configGR.addActiveQuery();
    configGR.addQuery('sys_domain', currentDomain);
    configGR.query();
    configGR.next();

    var applyToAllGroups = configGR.getValue('apply_to_all_groups') == 1;

    var groupsList = configGR.getValue('apply_to_groups');
    var groupsGR = new GlideRecord('sys_user_group');
    groupsGR.addQuery('sys_id', 'IN', groupsList);
    groupsGR.query();

    while (groupsGR.next()) {
        var selectedGroups = [];
        var groupItem = {};
        groupItem.id = groupsGR.getUniqueValue();
        groupItem.label = groupsGR.getDisplayValue('name');
        selectedGroups.push(groupItem);
        selectedGroupsResult.push(selectedGroups);
    }

    var gr = new GlideRecord('sys_user_group');
    gr.addActiveQuery();
    gr.setLimit(1000);
    gr.query();

    while(gr.next()) {
        var groupId = gr.getUniqueValue();
        var item = {};
        var definitionName = gr.getDisplayValue('name');
        item.label = definitionName;
        groups[groupId] = item;
    }

    availableResult.group = groups;

    var result = {
        availableResult: availableResult,
        applyToAllGroups: applyToAllGroups,
        selectedGroupsResult: selectedGroupsResult
    };

    context.props_details.applyToAllGroups = result.applyToAllGroups;
    context.props_details.groupItems = result.availableResult;
    context.props_details.groupSelectedItems = result.selectedGroupsResult;
})(context, pageParams, blockcontext, dataParams);
