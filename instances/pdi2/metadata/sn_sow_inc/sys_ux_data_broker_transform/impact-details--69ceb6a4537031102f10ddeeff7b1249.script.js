function transform(input) {
    var impactDetails = {};
    var incSysId = input.sysId;
    var incGr = new GlideRecord("incident");
    if (incGr.get(incSysId)) {
        impactDetails = new SOWIncidentImpact().getImpactDetails(incGr);
    }
    return impactDetails;
}
