function onClick() {
    var selectedGrpIds = g_list.getChecked();
    var sysIdList = selectedGrpIds.split(',');
    var numSel = sysIdList.length;
    if (numSel > 0) {
        var currentSubscriptionUrl = top.location.href;
        var subscriptionSysId = currentSubscriptionUrl.split('/')[6];

        // script-include
        var ga = new GlideAjax('sn_sub_man.SubscriptionGroupService');
        //method
        ga.addParam('sysparm_name', 'addGroupsToSubscription');
        //parameters
        ga.addParam('subscriptionSysId', subscriptionSysId);
        ga.addParam('groupIds', sysIdList);
    } else
        alert('No records selected');

    ga.getXMLAnswer(getResponse);

    function getResponse(response) {
        if (response) {
            //this refreshes the current list view
            g_list.refresh();
        }

    }
}
