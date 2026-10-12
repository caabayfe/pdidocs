function transform() {
    var result = {
        domain: ""
    };
    var snHelpService = new global.SNHelpService();
    var domainID = snHelpService.fetchDomain();
    result.domain = domainID;
    return result;
}
