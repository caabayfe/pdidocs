async function script({ api, event, helpers, imports }) {
    // fetchDynamicCIGroupMembersCompleted in (CI) Properties UI Controller; fired after data broker get_dynamic_ci_group_members completes.
    const {  buildStackedValueObj, getNameObj, buildDynamicCIGroupRouteObject, getClassDisplayNameObj, DYNAMIC_GROUP_COLUMNS } =
        imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();
    var ciSysId = api.context.props.ciSysid;
    var DYNAMIC_CI_GROUP_MEMBERS_TEXT = await helpers.translate("Dynamic CI Group Members");
    var result = api.data?.get_dynamic_ci_group_members?.output;

    //Check if cache exists
    let cache = api.state.cache;
    if (!cache[ciSysId]) {
        cache[ciSysId] = {};
    }
    if (result) {
        const rowCount = result.dynamic_ci_group_members.rowCount;
        const maxCount = result.dynamic_ci_group_members.maxCardCount;
        const ciBaseProperties = populateGroupMemberList(result.dynamic_ci_group_members.groupMembers);
        
        ciBaseProperties.isDynamicGroupCI = true;
        ciBaseProperties.showDynamicCIAlertMessage = rowCount > maxCount;
        
        if (ciBaseProperties.showDynamicCIAlertMessage) {
          ciBaseProperties.alertMessage = await helpers.translate("Showing {0} of {1} CIs.", maxCount, rowCount.toLocaleString());
        }
        api.setState("dynamicCIGroupRouteParams", buildDynamicCIGroupRouteObject(ciSysId, DYNAMIC_CI_GROUP_MEMBERS_TEXT));
        api.setState("ciBaseProperties", ciBaseProperties);

        cache[ciSysId].groupMembers = {
            groupMembers:  ciBaseProperties.groupMembers,
            groupMembersCount: ciBaseProperties.groupMembersCount,
            isDynamicGroupCI: ciBaseProperties.isDynamicGroupCI,
            alertMessage: ciBaseProperties.alertMessage,
            showDynamicCIAlertMessage: ciBaseProperties.showDynamicCIAlertMessage
        };
        api.setState('cache', cache);
    }
     else {
        //no ci because:
        // 1) map background is clicked
        // 2) a search is issued (need to fetch data first)
    }

    function populateGroupMemberList(members) {
        var groupMemberList = {};

        groupMemberList  = Object.keys(members).reduce((acc, current) => {
            var propertiesObj = {};
            // Split into rows of size 2 as required by stacked label component
            var result = Object.keys(members[current].properties).reduce((res, value) => {
                var curr = buildStackedValueObj(value, members[current].properties[value] || api.state.translations.NONE);
                if (res && res[res.length-1] && res[res.length-1].length == 1) {
                    res[res.length - 1].push(curr)
                } else {
                    res.push([curr]);
                }
                return res;
            },[]);
            
            result.sysId = current;
            result.name =  getNameObj(members[current].name);
            result.classDisplayName = getClassDisplayNameObj(members[current].classDisplayName);
            propertiesObj = members[current].properties;
            propertiesObj[DYNAMIC_GROUP_COLUMNS.NAME] = members[current].name;
            propertiesObj[DYNAMIC_GROUP_COLUMNS.DISPLAY_NAME] = members[current].classDisplayName;
            result.properties = propertiesObj;
            return [...acc, result];
        },[]);
    
        let ciBaseProperties =  api.state.ciBaseProperties;
        ciBaseProperties.groupMembers = groupMemberList;
        ciBaseProperties.groupMembersCount =  groupMemberList.length;
        return ciBaseProperties;
    }
}
