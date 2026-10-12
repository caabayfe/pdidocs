function transform(input) {
    var rlConfig = [];
	var relatedListLayout = input.relatedListLayout;

    if (input.parentSysId == -1 || (relatedListLayout && relatedListLayout != "vertical")) {
        return rlConfig;
    }

    var extns = new GlideScriptedExtensionPoint().getExtensions("sn_sow_record.SOWRouteUtil");
    if (extns.length > 0) {
        for (var i = 0; i < extns.length; i++) {
            if (extns[i].handles(input.parentTable, input.parentSysId)) {
                try {
                    rlConfig = extns[i].getRelatedListConfig(input.parentTable, input.parentSysId);
                    if (typeof rlConfig != "undefined")
                        return rlConfig;
                } catch(e) {
                    break;
                }
                break;
            }
        }
    }

    return [{
        "label": gs.getMessage("Related records"),
        "id": "sow_related_records",
        "exclusionList": null,
        "inclusionList": null
    }];
}
