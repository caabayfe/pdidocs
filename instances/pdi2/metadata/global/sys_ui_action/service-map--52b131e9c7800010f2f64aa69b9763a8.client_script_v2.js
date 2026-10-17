function onClick(g_form) {
    var mySysID = g_form.getSysId();

    g_aw.openRecord('noc_service_map', genUniqueSysId(mySysID), {
        isEm: false,
        serviceId: mySysID,
        componentId: genUniqueSysId(mySysID)
    });
}

var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
var genUniqueSysId = function genUniqueSysId(sysId) {
    if (!sysId) return sysId;
    var charArr = sysId.split('');
    var newSysId = charArr.map(function(ch) {
        var idx = digits.indexOf(ch);
        var newIdx = (idx + 1) % digits.length;
        return digits[newIdx];
    });
    return newSysId.join('');
};
