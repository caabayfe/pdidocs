function transform(input) {
    var table = input.table;
    var gr = new GlideRecord(table);
    var result = {};
    if (input.sysId != '-1' && gr.get(input.sysId) && gr.canRead()) {
        if (table == 'incident' || table == 'interaction') {
            var recordInfo = new sn_sow_inc.SOWIncidentInfo(gr);
            result = recordInfo.getRecordInfo();
        }
        if (table === 'interaction' && gr.getValue('type') === 'walkup') {
            var interactionInfo = new sn_sow_walkup.WalkupInteractionInfo(gr);
            var interactionRecordInfo = interactionInfo.getRecordInfo();
            for (var key in interactionRecordInfo) {
                if (interactionRecordInfo.hasOwnProperty(key)) {
                    if (key == 'headerInfo') {
                        result['walkupHeaderInfo'] = interactionRecordInfo[key];
                    } else {
                        result[key] = interactionRecordInfo[key];
                    }
                }
            }
        } else {
            result.hideWalkupSummary = true;
        }
    } else {
        return {
            instanceTimeZone: gs.getProperty('glide.sys.default.tz'),
            hideWalkupSummary: true
        };
    }
    return result;
}
