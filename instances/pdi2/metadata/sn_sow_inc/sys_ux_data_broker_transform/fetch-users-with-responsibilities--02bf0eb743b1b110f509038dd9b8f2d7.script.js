function transform(input) {
    var sysId = input.sys_id;
    if (sysId == "")
        return;
    try {
        var userObj = new sn_sow_inc.PIRManager().getUsersWithResponsiblity(sysId);
        return userObj;
    } catch (e) {
        gs.error('Failed to fetch user related details : ' + e);
        return new Error('Failed to fetch user related details');
    }
}
