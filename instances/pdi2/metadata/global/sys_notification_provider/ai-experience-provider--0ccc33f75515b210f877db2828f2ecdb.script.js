(function send(/* DeliveryContext */ deliveryContext,
            /* ProviderService */ providerService,
        /* DestinationDescriptors */ destinations) {

    var providerUtil = new AIExperienceProviderUtil(deliveryContext, providerService, destinations);
    providerUtil.processNotifications();

    })(deliveryContext, providerService, destinations);
