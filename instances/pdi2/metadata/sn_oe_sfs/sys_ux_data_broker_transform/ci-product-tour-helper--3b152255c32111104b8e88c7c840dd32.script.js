function transform(input) {
    if (!input.appId || !input.table) return null;
    try {
        var response =  new sn_oe_sfs.CIUtil().getProductTour(input.appId, input.table);
		return response;
    } catch (e) {
        gs.error('Failed fetching product tours for App: ' + appId + ' and table: ' + table + '. ' + e.toString());
        return null;
    }
}
