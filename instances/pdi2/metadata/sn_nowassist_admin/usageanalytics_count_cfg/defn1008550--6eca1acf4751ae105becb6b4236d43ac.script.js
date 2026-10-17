var answer = 0;
var statusMap = {};
var statusGr = new GlideRecord('sn_nowassist_skill_config_status');
if (statusGr.isValid()) {
    statusGr.query();
    while (statusGr.next()) {
        var key = statusGr.getValue('skill_config');
        if (!(key in statusMap)) {
            statusMap[key] = parseInt(statusGr.getValue('active'));
        }
    }
}

var configGr = new GlideRecord('sn_nowassist_skill_config');
if (configGr.isValid()) {
    configGr.query();
    while (configGr.next()) {
        var configId = configGr.getUniqueValue();
        if (statusMap.hasOwnProperty(configId)) {
            answer += statusMap[configId];
        } else {
            answer += parseInt(configGr.getValue('active'));
        }
    }
}
