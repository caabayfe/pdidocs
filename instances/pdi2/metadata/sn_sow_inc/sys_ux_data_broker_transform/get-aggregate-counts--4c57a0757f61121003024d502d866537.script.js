function transform(input) {
    var utils = new SOWIncidentOverviewUtils();
    return {
        affected_ci_count: utils.getAffectedCICount(input.sysId),
        impacted_ci_count: utils.getImpactedCICount(input.sysId),
        asset_count: utils.getAssetCount(input.sysId)
    };
}
