function transform(input) {
    const internalInstanceOverride = gs.getProperty('glide.ua.downloader.central_instance.servicenow_internal_instance_override', 'false') === 'true';

    const isSnInstance = () => {
        return new sn_entitlement.InstanceInfoUtil().isServiceNowInstance();
    };

    return internalInstanceOverride || !isSnInstance();
}
