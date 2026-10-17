(function() {
	data.sys_id = $sp.getParameter('sys_id');
	data.allowConfig = true;
	data.timeFormat = new global.CalendarUtils().getUserTimeFormat().replace(/\W*%s/, "");
	data.dateTimeFormat = gs.getDateTimeFormat().replace(/y/g, "Y").replace(/d/g, "D");
})();
