function onLoad() {
    var selectedSvcVal = g_form.getValue('rest_api');
    g_form.clearOptions('rest_api');

    var otherSvcsNV = {};
    for (var svcName in g_scratchpad.svcOptionInfos) {
        var opVal = getOpValue(g_scratchpad.svcOptionInfos[svcName]);
        var opName = getOpName(svcName, g_scratchpad.svcOptionInfos[svcName]);

        //add selected svc first.
        if (opVal == selectedSvcVal)
            g_form.addOption('rest_api', opVal, opName, 0);
        else
            otherSvcsNV[opName] = opVal;
    }

    for (var key in otherSvcsNV) {
        g_form.addOption('rest_api', otherSvcsNV[key], key);
    }
}

function getOpValue(svcInfo) {
    if (svcInfo['scripted'])
        return svcInfo['sysId'];
    else
        return svcInfo['route'];
}

function getOpName(svcName, svcInfo){
    return svcName + "   ["+svcInfo['route']+"]";
}
