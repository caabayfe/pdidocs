function transform(input){
	var subscription_detail = new sn_entitlement.SubscriptionEntitlementsService().getEntitlementDetails("IntegrationHubPool")[0];
	return subscription_detail.purchased_count + "";
}	
