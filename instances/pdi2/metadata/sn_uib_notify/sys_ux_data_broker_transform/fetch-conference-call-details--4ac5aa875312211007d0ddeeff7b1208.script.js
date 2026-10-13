function transform(input) {
    var confUtils = new sn_uib_notify.NotifyUXFConferenceUtil();
    return confUtils.getConferenceCardData(input.sysId);
}
