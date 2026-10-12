function transform(input) {

    if (!input.tableName || !input.recordSysId || !input.userId || !GlidePluginManager.isActive('com.snc.notify'))
        return false;
		
    var notifyUtil = new global.NotifyUtil();
    var SMS = "sms";
    var isTelephonySupported = false;
    var isValidNumberAvailable = false;
    var notifyNumbersAndProviders = notifyUtil.getOrderedListOfNotifyNumbersAndProviders(input.tableName, input.recordSysId);
    var orderedNumbersAndProviders = notifyNumbersAndProviders.orderedNumbersAndProviders;
    orderedNumbersAndProviders.forEach(function(provider) {
        if (provider.type === 'number')
            isTelephonySupported = true;
    });

    var validNumbers = notifyUtil.getUniquePhoneNumbersForUsersAndGroups([], [input.userId], [], SMS);
    isValidNumberAvailable = validNumbers.length > 0 ? true : false;
    return isValidNumberAvailable && isTelephonySupported;
}
