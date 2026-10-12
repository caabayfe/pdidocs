function transform(input) {
    var res = {};
    var sc = new global.PAScorecard();
    sc.addParam('uuid', '84911f0aff532210c212ffffffffff74');
    var result = sc.query();
    res.apiCalls = (result.length > 0 && result[0].value != null) ? result[0].value : 0;
    res.total = new sn_vsc.SCMetricsUtil().getIntegrationAccountCount();
    return res;
}
