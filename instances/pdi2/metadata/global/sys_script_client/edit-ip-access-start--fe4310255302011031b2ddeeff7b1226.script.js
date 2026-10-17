function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    var ipAccess = new GlideAjax('IPAccessHandler');
    var saveAndClose = true;
    ipAccess.addParam('sysparm_name', 'validateRangeStartIP');
    ipAccess.addParam('sysparm_newValue', newValue);
    ipAccess.addParam('sysparm_sysId', sysIDs);
    ipAccess.addParam('sysparm_table', table);
    ipAccess.getXML(callBackFunction);

    function callBackFunction(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
		var res = JSON.parse(answer);
        if (res.status === 'false') {
			alert(res.message);
			callback(false);
		}
		else
			callback(true);				
    }
	
}
