function transform(input) {
    var instanceProperties = {};
    var util = new sn_hermes.HermesUtil();
    var uri = util.getHostForIPKI();
    if (uri == null) {
        uri = gs.getProperty('glide.servlet.uri');
    }
    instanceProperties.uri = uri;
    return instanceProperties;
}
