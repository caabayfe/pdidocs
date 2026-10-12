async function handler({api, event, helpers, imports }) {
    const {
        handleLinkClick,
        CMDB_TABLE_NAMES,
        LINK_TYPES,
        PAGE_ROUTES,
        HREF_FOR_ROUTE_TYPE,
        BASE_AGG_POLICY_TYPE_GROUP_BY_VALUE_TO_ID
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    var table = CMDB_TABLE_NAMES.CMDB_DATA_MANAGEMENT_TASK;
    var fixedFilter = "active=true";
    var title = "undefined";
    var columns = "";
    var view = "cmdb_ws";

    if (event.payload.id === 'dm_open_tasks') {
        fixedFilter = "active=true^stateIN1,2";
        title = await helpers.translate('Open tasks');
    } else if (event.payload.id === 'dm_unassigned_tasks') {
        fixedFilter = "active=true^state!=8^assigned_toISEMPTY^assignment_groupISEMPTY";
        title = await helpers.translate("Unassigned tasks");
    } else if (event.payload.id === 'dm_overdue_tasks') {
        fixedFilter = "active=true^state!=8^due_date<javascript:gs.beginningOfToday()";
        title = await helpers.translate("Overdue tasks");
        columns = "number, due_date, policy_id, policy_id.cmdb_policy_type, state, assignment_group, assigned_to";
        view = "";
    } else if (event.payload.id === 'dm_pending_tasks') {
        fixedFilter = "active=true^state=-5";
        title = await helpers.translate("Pending tasks");
    } else if (event.payload.id === 'dm_closed_tasks') {
        fixedFilter = "stateIN3,4,8";
        title = await helpers.translate("Closed tasks");
    } else if (event.payload.id === 'dm_aging_tasks') {
        fixedFilter = 'active=true^state!=8';
        var query = event.payload?.payload?.query;
        var filterArr = query.split("^");
        for(var i = 0; i < filterArr.length; i++) {
            var filter = filterArr[i];
            var splitFilter = filter.split("=");
            if (splitFilter[0] === "group_by") {
                // DEF0676588: There was a change done that changed the "name" field on the cmdb_policy_type table to a translated field. This then broke the aging task filter.
                // In order to reduce the number of changes needed, using the mapping to sys_id instead of name
                fixedFilter += "^policy_id.cmdb_policy_type.sys_id="+BASE_AGG_POLICY_TYPE_GROUP_BY_VALUE_TO_ID[splitFilter[1]];
            } else if(splitFilter[0] === "dynamic_group_by") {
                var ageRange = splitFilter[1]; //parse ageRange into query
                if(ageRange.indexOf(">") != -1) {
                    var days = ageRange.match(/(\d+)/)[0]; //get digit value out of the label
                    fixedFilter += '^opened_at<javascript:gs.daysAgo(' + days + ')';
                } else if(ageRange.indexOf(" - ") != -1) {
                    var dates = ageRange.split(" - ");
                    var startRange = parseInt(dates[0].match(/(\d+)/)[0]) - 1;
                    var endRange = dates[1].match(/(\d+)/)[0];
                    fixedFilter += '^opened_at<javascript:gs.daysAgo(' + startRange + ')'
                    + '^opened_at>=javascript:gs.daysAgo(' + endRange  + ')';
                }
            }
        }
        title = await helpers.translate("Aging tasks");
    } else if (event.payload.id === 'dm_failing_policies') {
        table = "sn_cmdb_ws_policies_failing_evaluation";
        fixedFilter = ""; //condition of status = 'Evaluation Failed' was already applied to the DB view
        title = await helpers.translate("Policies failing evaluation");
    } else {
        //undefined payload id, shouldn't be opening up any pages
        console.log("Error: undefined payload id for data visualization event");
        return;
    }

    const value = {
        type: LINK_TYPES.ROUTE,
        href: HREF_FOR_ROUTE_TYPE,
        openNewWindow: false,
        route: {
            route: PAGE_ROUTES.LIST,
            fields: {
                table: table
            },
            params: {
                listTitle: title,
                fixedFilter: fixedFilter,
                view: view, 
                columns: columns,
                hideActions: true
            }
        }
    };

    handleLinkClick(helpers, value);
}
