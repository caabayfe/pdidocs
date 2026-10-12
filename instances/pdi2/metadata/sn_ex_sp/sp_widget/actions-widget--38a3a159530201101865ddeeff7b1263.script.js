(function() {

    var groupid = options.action_group;
    data.context = options.context;
    data.table = options.table;
    var gr = null;
    data.overflowbtnlabel = options.overflowbtnlabel || "";


    var prepareActions = function(table, context, maxButtonCount, groupid,
                                  buttonDirectionReversed, moreIcon, primaryColoredButton) {

        if (!gs.nil(maxButtonCount) && maxButtonCount > 0) {
            data.max_button_count = maxButtonCount - 1;
        } else {
            data.max_button_count = 0;
        }

        if (!gs.nil(buttonDirectionReversed))
            data.button_direction_reversed = buttonDirectionReversed;

        if (!gs.nil(moreIcon))
            data.more_icon = moreIcon;
        else
            data.more_icon = 'fa-ellipsis-v';

        if (!gs.nil(primaryColoredButton))
            data.primary_colored_button = primaryColoredButton;

        data.context = context;
        data.table = table;

        if (!gs.nil(table) && !gs.nil(context)) {
            gr = new GlideRecordSecure(table);
            if (!gr.get(context))
                gr = null;
            else if (!gr.canRead())
                gr = null;
        }

        var clientCall = new sn_ex_sp.ActionUtil(gr);
        clientCall.toggleParameterTypes();
        if (input && input.hasOwnProperty('action') && input.action === 'getServrOutput') {
            data.actionOutput = clientCall.executeActionServerScript(input.actionId, JSON.parse(input.actionInputs));
            return;
        }

        var actions = clientCall.fetchActionsForGroup(groupid);
        var formattedActions = clientCall.fetchFormattedActions(actions);
        data.dynamicParameterMap = clientCall.dynamicParameterMap;
        data.esignRequiredObj = clientCall.getEsignObj();

        // Set value of dynamic params for this action group
        Object.keys(options).forEach(function(param) {
            if (data.dynamicParameterMap.hasOwnProperty(param)) {
                data.dynamicParameterMap[param] = options[param];
            }
        });

        var portalGr = $sp.getPortalRecord();
        data.portalSysId = portalGr.getDisplayValue('sys_id');
        data.portalSuffix = portalGr.getDisplayValue('url_suffix');

        if (actions.length <= (data.max_button_count + 1)) {
            data.actionButtons = formattedActions;
            return;
        } else {
            if (data.max_button_count === 0 && formattedActions[0].primary === true) {
                data.actionButtons = formattedActions.splice(0, 1);
            } else {
                data.actionButtons = formattedActions.splice(0, data.max_button_count);
            }
            data.otherActions = formattedActions;
        }
    };

    var clientRequestToRetrieveActions = input && input.hasOwnProperty('action') && input.action === 'retrieveActions';
    if (clientRequestToRetrieveActions)
        prepareActions(input.table,
                         input.context,
                         input.max_button_count,
                         input.action_group,
                         input.button_direction_reversed,
                         input.more_icon,
                         input.primary_colored_button);
    else
        prepareActions(options.table,
                         options.context,
                         options.max_button_count,
                         groupid,
                         options.button_direction_reversed,
                         options.more_icon,
                         options.primary_colored_button);
})();
