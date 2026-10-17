function onClick() { 
	var currentSubscriptionUrl = top.location.href;
	var subscriptionSysId = currentSubscriptionUrl.split('/')[6];
	top.window.location = '/now/subscription/allocate-groups/' + subscriptionSysId;
}
