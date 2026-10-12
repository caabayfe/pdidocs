answer = checkAccessToChannelRecord();

function checkAccessToChannelRecord() {
    var dpSecurityUtil = new DataPrivacySecurityUtil();
    return dpSecurityUtil.canAccessChannelRecordsByArrayStr(current);
}
