//getDynamicCiGroupMembers script in (CI) Properties UI Controller; 
//this script gets fired after the ciSysid input prop changes
async function script({ api, event, helpers, imports }) {
    //both ci and class populated with connection, empty means they want CI data
    var DYNAMIC_CI_GROUP_MEMBERS_TEXT = await helpers.translate("Dynamic CI Group Members");
    let ciSelected = !!api.context.props.ciSysid && !!api.context.props.ciClass && !api.context.props.connectionId;
    var sysId = api.context.props.ciSysid;
    const { isDynamicCIGroup, buildDynamicCIGroupRouteObject } = imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();
    api.setState("dynamicCIGroupRouteParams", {});
    if(api.context.props.ciClass && isDynamicCIGroup(api.context.props.ciClass)){
        //trigger broker or get from cache
        var ci = api.state.cache[event.payload.value];
        if (event.payload.name === "timestamp" || (ciSelected && (!ci || !ci.groupMembers))) { //trigger broker
            api.setState('dynamicCIGroupMemberBrokerInputs', {
                ciSysid: api.context.props.ciSysid,
                ciClass: api.context.props.ciClass,
                workspaceId: api.context.app.appId,
                configIdentifierId: api.context.props.configIdentifierId
            });
        } else if (ciSelected) { //get from cache
            const { groupMembers, groupMembersCount, isDynamicGroupCI, showDynamicCIAlertMessage, alertMessage } = ci.groupMembers;
            const ciBaseProps = { ...api.state.ciBaseProperties,
                 groupMembers: groupMembers, 
                 groupMembersCount: groupMembersCount,
                 isDynamicGroupCI: isDynamicGroupCI,
                 showDynamicCIAlertMessage: showDynamicCIAlertMessage,
                 alertMessage: alertMessage };
            api.setState('ciBaseProperties', ciBaseProps);
            api.setState('dynamicCIGroupRouteParams', buildDynamicCIGroupRouteObject(sysId, DYNAMIC_CI_GROUP_MEMBERS_TEXT));
        }
    }
}
