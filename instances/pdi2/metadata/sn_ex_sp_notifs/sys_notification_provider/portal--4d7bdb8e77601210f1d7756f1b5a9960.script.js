(function send(/* DeliveryContext */ deliveryContext,
         /* ProviderService */ providerService,
        /* DestinationDescriptors */ destinations) {

    var providerUtil = new sn_ex_sp_notifs.PortalProviderUtil(deliveryContext, providerService, destinations);
	providerUtil.processNotifications();

})(deliveryContext, providerService, destinations);
