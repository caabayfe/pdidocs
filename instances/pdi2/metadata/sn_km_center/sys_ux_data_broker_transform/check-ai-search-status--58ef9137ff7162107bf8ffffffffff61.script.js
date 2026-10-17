function transform(input) {
    var ais = new sn_ais.StatusApi();
    return ais.isAisEnabled() && ais.isAisInitialized();
}
