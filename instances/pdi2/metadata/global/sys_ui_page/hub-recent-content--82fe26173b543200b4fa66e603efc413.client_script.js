function onLoad() {
    $j('.table > caption + thead > tr:first-child > th ').css("padding-left", "7px");
    var listTable = $j('table > tbody > tr > td.list_div_cell');
	listTable.on('click', 'tbody.list2_body > tr.list_row a.linked', function(e) { e.preventDefault(); });
	listTable.on('click', 'tbody.list2_body > tr.list_row', function(e) {
		if (e.target.nodeName != "LABEL" && e.target.nodeName != "INPUT") {
			e.preventDefault();
			var sysId = this.getAttribute("sys_id");
			if (sysId) {
				if (this.querySelector(':nth-child(4)').querySelector('a')) {
					var scopeId = this.querySelector(':nth-child(4)').querySelector('a').getAttribute("sys_id");
					window.parent.postMessage({"source": "hub_recent_content", "sys_id": sysId, "scopeId": scopeId}, '*');
				} else {
					window.parent.postMessage({"source": "hub_recent_content", "sys_id" :sysId}, '*');
				}
			}
			return false;
		}
	});
}
$j(onLoad);
