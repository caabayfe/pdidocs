function transform(input) {
    var HI_URL_PROPERTY_NAME = 'glide.upgrade_center.hi_url';
    var MANAGEMENT_HOST_PROPERTY_NAME = 'glide.management.host';
    var DEFAULT_HI_URL = 'https://hi.service-now.com/';

    // mirrors: HiUpgradeMetadataComponent from upgrade_center
    var hiUrl = gs.getProperty(
        HI_URL_PROPERTY_NAME,
        gs.getProperty(MANAGEMENT_HOST_PROPERTY_NAME, DEFAULT_HI_URL)
    );

    return hiUrl.endsWith('/') ? hiUrl : hiUrl + '/';
}
