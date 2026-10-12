(function executeRule(current, previous /*null when async*/ ) {
    const subscriptionTypePerUser = parseInt(sn_entitlement.LicensingEngineConstants.PER_USER_LICENSE);
    const subscriptionType = parseInt(current.subscription.subscription_type);
    const unconfirmedUserCountDisplay = subscriptionType === subscriptionTypePerUser ? current.unconfirmed_user_count : '-';
    current.setValue("unconfirmed_user_count_display", unconfirmedUserCountDisplay);

})(current, previous);
