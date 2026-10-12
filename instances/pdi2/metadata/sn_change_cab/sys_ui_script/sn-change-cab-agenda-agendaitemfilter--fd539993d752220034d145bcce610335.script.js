angular.module("sn.change_management.cab.agenda")
.filter("agendaItemFilter", ["CAB", "meetingAgenda", "$log", function(CAB, meetingAgenda, $log) {
	return function(items, filter, userId, pageNum) {
		if (!items || items.length === 0)
			return [];

		if (!filter || CAB.VALID_FILTERS.indexOf(filter) === -1) 
			filter = CAB.ALL;

		if (isNaN(pageNum) || pageNum < 0)
			pageNum = 0;

		var startAt = pageNum * CAB.AGENDA.PAGE_SIZE;			
		var result = [];
		var pageCount = 0;

		items.some(function(item) {	
			if (!meetingAgenda.agendaItemFilters[filter].call({"userId": userId}, item))
				return;
			
			if (pageCount < startAt) {
				pageCount++;
				return;
			}
				
			result.push(item);
				
			// If we have the complete page, no need to do any more
			if (result.length === CAB.AGENDA.PAGE_SIZE)
				return true;
		});
			
		return result;
	};
}]);
