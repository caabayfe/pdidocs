// Only show members of current group when selecting the roster members
//
// 'lookup' is the GlideRecord that we will be using to select the users for the M2M list
//

// Get the list of users in this group
gs.log("Getting users from group (" + current.rota.group + ")");
var userIds = new Array();
var userGR = new GlideRecord('sys_user_grmember');
userGR.addQuery("group", current.rota.group);
userGR.query();
while (userGR.next()) {
    userIds.push(userGR.user.toString());
}

var encoded = 'sys_idIN' + userIds.join(',');
lookup.addEncodedQuery(encoded);
