function($scope, runtimeState, meetingAgenda, spUtil, $log) {
	// Convert old timezone codes to the new ones
	var SHORT_IDS = {
		"ACT": "Australia/Darwin",
		"AET": "Australia/Sydney",
		"AGT": "America/Argentina/Buenos_Aires",
		"ART": "Africa/Cairo",
		"AST": "America/Anchorage",
		"BET": "America/Sao_Paulo",
		"BST": "Asia/Dhaka",
		"CAT": "Africa/Harare",
		"CNT": "America/St_Johns",
		"CST": "America/Chicago",
		"CTT": "Asia/Shanghai",
		"EAT": "Africa/Addis_Ababa",
		"ECT": "Europe/Paris",
		"IET": "America/Indiana/Indianapolis",
		"IST": "Asia/Kolkata",
		"JST": "Asia/Tokyo",
		"MIT": "Pacific/Apia",
		"NET": "Asia/Yerevan",
		"NST": "Pacific/Auckland",
		"PLT": "Asia/Karachi",
		"PNT": "America/Phoenix",
		"PRT": "America/Puerto_Rico",
		"PST": "America/Los_Angeles",
		"SST": "Pacific/Guadalcanal",
		"VST": "Asia/Ho_Chi_Minh"
	};
	var rawTz = window.g_tz;
	window.g_tz = SHORT_IDS[rawTz] || rawTz;
	
	var c = this;
	var isAlreadyWarned = false;
	var meetingId = c.data.sys_id;
	var RELEVANT_FIELDS = ['start_date', 'end_date', 'short_description',
												 'number', 'assigned_to', 'assignment_group'];
	c.configOptions = {};
	c.keyNav = true;
	
	runtimeState.get(meetingId)
	.then(function (rst) {
		$scope.rst = rst;
		return meetingAgenda.get(meetingId);
	})
	.then(function(agenda){
		$scope.agenda = agenda;
	});
	
	function refreshCalendar(agendaItemId) {
		if (!agendaItemId) {
			c.change = null;
			return;
		}
		
		meetingAgenda.getAgendaItem(agendaItemId)
		.then(function(agendaItem){
			if (!agendaItem.task.record) {
				c.change = null;
				return;
			}
			c.change = agendaItem.task.record;
		});
	}
	
	$scope.$watch(function() {
		return runtimeState.getViewAgendaItem();
	}, refreshCalendar);
	
	c.onWarn = function (msg) {
		if (!isAlreadyWarned) {
			$log.warn(msg);
			spUtil.addErrorMessage(msg);
			isAlreadyWarned = true;
		}
	};
}
