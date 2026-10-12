function transform(input) {
    var result = {};

    var eps = new GlideScriptedExtensionPoint().getExtensions("sn_sow_record.SOWRouteUtil");
    for (var i = 0; i < eps.length; i++) {
        if (eps[i].handles(input.table, input.sysId)) {
            result = eps[i].getRecordRoutes(input.table, input.sysId);
            break;
        }
    }
    return result;
}
