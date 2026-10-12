angular.module("sn.change_management.cab.core", [])
.constant('CAB', {
	AGENDA: {
		REQUEST_LIMIT: 60,
		REQUEST_SKEW: 20,
		TIMEOUT_MAX: 2000,
		TIMEOUT_SKEW: 2000,
		PAGE_SIZE: 40,
		CHANNEL_WATCH_MAX: 150
	},
	VALID_FILTERS: ["all","pending","mine","complete","approved"],
	FOCUS_TO_CHANGE_TAB: 'cab_change_tab:focus',
	AGENDA_ITEM: 'cab_agenda_item',
	DEFINITION: 'cab_definition',
	MEETING: 'cab_meeting',
	ATTENDEE: 'cab_attendee',
	RUNTIME_STATE: 'cab_runtime_state',
	CHANGE_REQUEST: 'change_request',
	TASK: 'task',
	APPROVAL_SERVICE: '/api/sn_change_cab/cab/approval/',
	SERVICE: {
		RUNTIME: '/api/sn_change_cab/cab/runtime_state/',
		AGENDA: '/api/sn_change_cab/cab/agenda/',
		AGENDA_ITEM: '/api/sn_change_cab/cab/agenda/item/',
		APPROVAL: '/api/sn_change_cab/cab/approval/',
		ATTENDEE: '/api/sn_change_cab/cab/attendee/',
		HOST_MEETING:'/api/sn_change_cab/cab/runtime_state/change_host/',
		NOTES_EDITOR:'/api/sn_change_cab/cab/runtime_state/notes_editor/',
		MEETING_CALENDAR: '/api/sn_change_cab/cab/meeting/calendar/',
		INITIAL: "/api/sn_change_cab/cab/initial/"
	},
	CAL_TAB: "cab-cal-tab",
	FORM_TAB: "cab-form-tab",
	PORTAL: {'ID': 'cab_workbench', 'SUFFIX': 'cab'},
	PORTAL_PREFIX: 'cab',
	PORTAL_ID: 'cab_workbench',
	WORKBENCH: 'cab_workbench',
	CALENDAR: 'cab_calendar',
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	COMPLETE: 'complete',
	CANCELED: 'canceled',
	PAUSED: 'paused',
	NO_DECISION: "no_decision",
	APPROVED: "approved",
	ALL: "all",
	MINE: "mine",
	PREAPPROVED: "preapproved",
	REJECTED: "rejected",
	ACTION_PAUSE: 'current_agenda_action_pause',
	ACTION_RESUME: 'current_agenda_action_resume',
	ACTION_NEXT: 'current_agenda_action_next',
	ACTION_FINISH: 'current_agenda_action_finish',
	ACTION_DUMMY: 'dummy',
	ACTION_APPROVE: 'current_agenda_action_approve',
	ACTION_REJECT: 'current_agenda_action_reject',
	ACTION_CURRENT_AGENDA_ITEM: 'current_agenda_item',
	SOW_PREFIX: "now/sow",
	SOW_MEETING: "cab-meeting"
})
.constant('MTG', {
	AGENDA_ITEM: 'mtg_agenda_item',
	ATTENDEE: 'mtg_attendee',
	DEFINITION: 'mtg_definition',
	MEETING: 'mtg_meeting',
	RUNTIME_STATE: 'mtg_runtime_state'
})
.constant('KEY', {
	"ESC": {
		"VAL": "Escape",
		"CODE": 27
	},
	"F6": {
		"CODE": 117
	},
	"TAB": {
		"VAL": "Tab",
		"CODE": 9,
	},
	"LEFT": {
		"VAL": "ArrowLeft",
		"CODE": 37
	},
	"RIGHT": {
		"VAL": "ArrowRight",
		"CODE": 39
	}
})
.directive("focusThis", ["$timeout", "$log", function($timeout, $log) {
    return {
		"restrict": 'A',
        "scope": {
			trigger: "<focusThis",
			scroll: "@preventFocusScroll"
		},
        "link": function(scope, element) {
            scope.$watch("trigger", function(value) {
                if (value === true)
                    $timeout(function() { element[0].focus({"preventScroll": scope.scroll}); });
            });
        }
    };
}])
.directive("correctFormFocus", [function() {
	return {
		"restrict": 'A',
		"link": function(scope, element) {
			function setDisabledFields(mutationList, observer) {
				mutationList.forEach(function(mutation) {
					if (mutation.addedNodes.length === 0)
						return;
					
					var target = mutation.target;
					var firstAdded = mutation.addedNodes[0];
					
					if (firstAdded.tagName === "INPUT" || firstAdded.tagName === "TEXTAREA") {
						firstAdded.setAttribute("disabled", "disabled");
						return;
					}

					if (target.tagName === "SPAN" && target.className === "type-glide_date_time field-actual" &&
						firstAdded.tagName === "DIV" && firstAdded.childNodes.length > 0)
					{
						firstAdded.childNodes[0].setAttribute("disabled", "disabled");
						return;
					}
				});	
			}
			
			var config = {
				"attributes": false,
				"childList": true,
				"subtree": true,
				"characterData": false
			};
			
			var observer = new MutationObserver(setDisabledFields);
			observer.observe(element[0], config);
		}
	};
}]);
