function goCompare(current) {

    // Get values from the list
    var tblName = g_list.getTableName(); // Get Table Name
    var selSysIds = g_list.getChecked(); // Get Selected Sys Ids
    selSysIds = selSysIds.split(",");

    var matchObjs = [];

    for (var i = 0; i < selSysIds.length; i++) {

        var matchGr = new GlideRecord(tblName);

        if (matchGr.get(selSysIds[i])) {
		
            var match = {
                'sys_id': matchGr.getValue('sys_id'),
                'expected_match': matchGr.getValue('expected_match')
            };
            matchObjs.push(match);
        }
    }
	
    var matchJSON = {};
    matchJSON[tblName] = matchObjs;
	
	// matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "value"},
    // {"sys_id": "<value>","expected_match": "value"}]}

    // Render Comparison Modal
    var modal = new GlideModal('cmdb_compare', false, 3000);
    modal.setPreference("sysCompareTable", tblName);
    modal.setPreference("sysMatchJSON", JSON.stringify(matchJSON));
    modal.setTitle("Compare CIs");
    modal.on('beforeclose', function(){
		refreshList();
	});
    modal.render();

    function refreshList() {
        g_list.refresh(1);
    }
}
