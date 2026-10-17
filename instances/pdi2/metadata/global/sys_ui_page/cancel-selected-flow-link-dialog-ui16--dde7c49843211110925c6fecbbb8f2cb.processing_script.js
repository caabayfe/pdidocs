UpBegin();

function UpBegin() {
	var gr = new GlideRecord(current_table);

	if (sys_id_list) {
		var selectedRecords = sys_id_list.split(',');
		for (var i = 0; i < selectedRecords.length; i++) {
			sn_fd.FlowAPI.scheduleCancel(selectedRecords[i], reason, 1);
		}
	}
	UpRefresh();
}

function UpRefresh() {
	var urlOnStack = GlideSession.get().getStack().bottom();
	response.sendRedirect(urlOnStack);
}
