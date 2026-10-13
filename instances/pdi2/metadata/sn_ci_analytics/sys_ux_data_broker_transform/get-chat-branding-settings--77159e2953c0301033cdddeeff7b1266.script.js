function transform(input) {
    var response = {};
    var brandingKey = input.brandingKey;
    if (sn_cs && sn_cs.VASystemObject) {
        response = sn_cs.VASystemObject.getSettings(brandingKey);
    }
    return response;
}
