function transform(input) {
    var isPluginActive = GlidePluginManager().isActive("sn_dex");
    if (!input || !input.ci || !isPluginActive) return [];
    var incomingIds = input.ci;
    var availabilityArray = [];

    for (var i = 0; i < incomingIds.length; i++) {
        try {
            var check = new sn_dex.DEXCommonUtils().isDexApplicable(incomingIds[i]).available;
            availabilityArray.push(check);
        } catch (e) {
            gs.error("Error retrieving availability for asset: " + incomingIds[i]);
            availabilityArray.push(false);
        }
    }
    return {"isPluginActive": isPluginActive, "availabilityArray": availabilityArray};
}
