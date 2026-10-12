/*! RESOURCE: /scripts/js_includes_vcab_calendar.js */
/*! RESOURCE: /scripts/app.vcab/calendar/_calendar.js */
angular.module('sn.itsm.vcab.calendar', ['sn.common', 'sn.calendar', 'sn.itsm.vcab.common', 'ui.bootstrap', 'ui.bootstrap.popover']);
;
/*! RESOURCE: /scripts/app.vcab/calendar/directive.cabChangeCalendar.js */
(function ($) {
'use strict';
var ALL_FILTER = 'all';
var NONE_FILTER = 'none';
function serializeObj(o) {
var s = '';
var keys = Object.keys(o);
for (var i = 0; i < keys.length; i++) {
var k = keys[i];
if (typeof o[k] === 'undefined' || k === ALL_FILTER || k === NONE_FILTER)
continue;
if (i > 0)
s += ',';
s += k + '=' + o[k];
}
return s;
}
function deserializeObj(s) {
var o = {};
if (s) {
var d = s.split(',');
for (var i = 0; i < d.length; i++) {
var p = d[i].split('=');
if (p[0] === ALL_FILTER || p[0] === NONE_FILTER)
continue;
o[p[0]] = p[1] === 'true';
}
}
return o;
}
function getPhantomKey(d) {
return d.getDate() + '~' + d.getMonth();
}
var UIDC = 1;
function uid() {
return UIDC++ + '';
}
angular.module('sn.itsm.vcab.calendar')
.directive('snCabChangeCalendar', function (getTemplateUrl, CalendarView, vcabDataSource, dataUtil, $timeout, TimelineView, i18n, calendarUtils,
$compile, userPreferences, $q, go, cancellablePromise) {
return {
restrict: 'E',
templateUrl: getTemplateUrl('vcab_sn_vcab_calendar.xml'),
scope: {
change: '=',
onWarn: '&',
isUpdatable: '@',
isConfigAvailable: '@',
configOptions: '=?',
dayViewOptions: '=?',
weekViewOptions: '=?',
configDescription: '@',
autoSaveAndFetchOptionsAsUserPref: '@'
},
link: function ($scope, el, attrs) {
var BLACKOUT_SECTION = 10, MAINT_SECTION = 20, CURR_CHANGE_SECTION = 30, RELATED_CHANGE_SECTION = 40;
var BLACKOUT_TYPE = 1, MAINT_TYPE = 2, BOTH_TYPE = 3;
var HAS_SPACE = 1, NO_SPACE = 0, NO_SPACE_FOR_ANYTHING = -1;
var LBL_MAINTENANCE_SCHEDULE = i18n.getMessage('Maintenance Window');
var LBL_BLACKOUT_SCHEDULE = i18n.getMessage('Blackout Schedule');
var LBL_MAINTENANCE_SCHEDULES = i18n.getMessage('Maintenance Windows');
var LBL_BLACKOUT_SCHEDULES = i18n.getMessage('Blackout Schedules');
var LBL_BOTH_SCHEDULES = i18n.getMessage('Blackout and Maint Schedules');
var LBL_MULTIPLE_MAINTENANCE_SCHEDULES = i18n.getMessage('Multiple Maintenance Windows');
var LBL_MULTIPLE_BLACKOUT_SCHEDULES = i18n.getMessage('Multiple Blackout Schedules');
$scope.SETTINGS_TAB = 1;
$scope.CONFIG_TAB = 2;
$scope.CalendarView = CalendarView;
function getCommonCalCtrl() {
return angular.element('.common-cal', el).controller('snDhtmlxScheduler');
}
function hasEnoughSpaceToShowEventText(start, end) {
var ctrl = getCommonCalCtrl();
if (ctrl) {
var width = ctrl.getEstimatedEventWidthInPx(start, end);
return width > 70 ? HAS_SPACE : (width >= 34 ? NO_SPACE : NO_SPACE_FOR_ANYTHING);
}
return NO_SPACE;
}
function getChangeLabel(change) {
var v = change.short_description.display_value;
if (v) {
v = v.replace(/"/g, "&quot;").replace(/'/g, "&apos;");;
}
return "<small>" + change.number.display_value + "</small>" + "<p><strong><sn-cab-line-clamp max-lines='2' text='" + v + "'>"
+ "</sn-cab-line-clamp></strong></p>";
}
function getWindowLabel(windowDisplayValue) {
return "<span class='cab_window_label'>" + windowDisplayValue + "</span>";
}
function getWindowEventText(id, data, start, end, sectionId) {
var t = "<div class='event_details' event_id='" + id + "'>";
if ($scope.viewMode === CalendarView.MONTH) {
t += '<strong>' + data.title + '</strong>';
} else {
var spc = hasEnoughSpaceToShowEventText(start, end);
var c = 'badge';
if (angular.isArray(data)) {
if (spc === NO_SPACE_FOR_ANYTHING)
c += ' size_zero_event';
else if (spc === NO_SPACE)
c += ' no_text_event'
}
if (spc === HAS_SPACE) {
var f = $scope.viewMode === CalendarView.DAY ? $scope.filters.dayView : $scope.filters.weekView;
if (f.dateTime) {
t += "<span class='date_range'>"
+ dataUtil.dateRangeToFriendlyText(start, end)
+ "</span>";
}
if (sectionId === BLACKOUT_SECTION)
t += "<p>" + LBL_BLACKOUT_SCHEDULE;
else
t += "<p>" + LBL_MAINTENANCE_SCHEDULE;
}
if (angular.isArray(data)) {
t += " <span class='" + c + "' uib-popover-template='\"cab_multi_window_popover.html\"'"
+" popover-append-to-body='true' popover-placement='right' popover-trigger='none' popover-is-open='isBadgePopupOpen'"
+" popover-class='cab_change_calendar_popover' popover-animation='false'"
+" ng-mouseenter='openBadgePopup()' ng-mouseleave='closeBadgePopup()'>" + data.length + "</span> ";
}
if (spc === HAS_SPACE) {
t+= "</p>";
}
}
t += "</div>";
return t;
}
function getChangeEventText(id, change, start, end) {
var t = "<div class='event_details' event_id='" + id + "'>";
if ($scope.viewMode === CalendarView.MONTH) {
t += '<strong>' + change.number.display_value + '</strong>';
} else {
if (hasEnoughSpaceToShowEventText(start, end) === HAS_SPACE) {
var f = $scope.viewMode === CalendarView.DAY ? $scope.filters.dayView : $scope.filters.weekView;
if (f.dateTime) {
t += "<span class='date_range'>"
+ dataUtil.dateRangeToFriendlyText(change.start_date, change.end_date)
+ "</span>";
}
if (f.number || (f.shortDescription && change.short_description.display_value))
t += "<p>";
if (f.number)
t += "<strong>" + change.number.display_value + "</strong> ";
if (f.shortDescription && change.short_description.display_value)
t += change.short_description.display_value;
if (f.number || (f.shortDescription && change.short_description.display_value))
t += "</p>";
if ($scope.viewMode === CalendarView.DAY) {
if ((f.assignee && change.assigned_to.display_value) || (f.group && change.assignment_group.display_value))
t += "<p>";
if (f.assignee && change.assigned_to.display_value)
t += change.assigned_to.display_value;
if (f.group && change.assignment_group.display_value) {
if (f.assignee && change.assigned_to.display_value)
t += '&nbsp;&nbsp;&nbsp;';
t += change.assignment_group.display_value;
}
if ((f.assignee && change.assigned_to.display_value) || (f.group && change.assignment_group.display_value))
t += "</p>";
}
}
}
t += "</div>";
return t;
}
function getNoNullStartDate(d) {
if (d)
return d;
return new Date(0);
}
function getNoNullEndDate(d) {
if (d)
return d;
return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
}
function changeToEvent(change, sectionId) {
var s = change.start_date = dataUtil.wsToJsDate(change.start_date);
var e = change.end_date = dataUtil.wsToJsDate(change.end_date);
var id = change.sys_id.value;
var ns = getNoNullStartDate(s);
var ne = getNoNullEndDate(e);
var e = {
id: id,
start_date: ns,
end_date: ne,
text: getChangeEventText(id, change, ns, ne),
change: change,
timeline_section: sectionId
};
return e;
}
function scheduleToEvents(schedule, sectionId) {
var events = [];
schedule.date_ranges.forEach(function (d, index) {
var id = schedule.sys_id;
if (schedule.date_ranges.length > 1)
id += "-" + (index + 1);
var s = d.start = dataUtil.wsToJsDate(d.start);
var e = d.end = dataUtil.wsToJsDate(d.end);
var e = {
id: id,
start_date: getNoNullStartDate(s),
end_date: getNoNullEndDate(e),
text: getWindowEventText(id, schedule, s, e, sectionId),
schedule: schedule,
date_range: d,
timeline_section: sectionId
};
events.push(e);
});
return events;
}
function updateEvent(eid) {
var ctrl = getCommonCalCtrl();
if (ctrl) {
ctrl.updateEvent(eid);
return true;
}
return false;
}
function refreshEventsText(notify) {
var eventUpdated = false;
if ($scope.events) {
$scope.events.forEach(function (e) {
if (e.change) {
e.text = getChangeEventText(e.id, e.change, e.start_date, e.end_date);
} else {
var data = e.is_multievent ? e.events : e.schedule;
e.text = getWindowEventText(e.id, data, e.start_date, e.end_date, e.timeline_section);
}
if (notify)
eventUpdated = updateEvent(e.id);
});
if (eventUpdated)
addPopoversToEventsIfNeeded();
}
}
function getEventFromId(id) {
if ($scope.events) {
for (var i = 0; i < $scope.events.length; i++)
if ($scope.events[i].id === id) {
return $scope.events[i];
}
}
if ($scope.phantomEvents) {
for (var k in $scope.phantomEvents) {
if ($scope.phantomEvents[k].id === id) {
return $scope.phantomEvents[k];
}
}
}
return null;
}
function compileTimelineLabels() {
$timeout(function () {
$('.dhx_scell_name', el).each(function () {
var needsCompilation = !$(this).hasClass('ng-scope');
if (needsCompilation) {
$compile(this)($scope);
}
});
}, 100);
}
var eventScopes = {};
var eventDuplicateCounts = {};
function addPopoversToEventsIfNeeded() {
var defer = $q.defer();
$scope.closeEditableChangePopups();
$timeout(function () {
var sameEventCounts = {};
$('.cab_event', el).each(function () {
var $this = $(this);
var needsCompilation = !$this.attr('uib-popover-template');
var eid = $('.event_details', this).attr('event_id');
if (!sameEventCounts[eid])
sameEventCounts[eid] = 1;
else
sameEventCounts[eid]++;
var scopeKey = eid + ':' + sameEventCounts[eid];
var scope = eventScopes[scopeKey];
var createNewScope = false;
if (!scope) {
createNewScope = true;
} else if (needsCompilation) {
scope.$destroy();
createNewScope = true;
}
if (createNewScope) {
scope = $scope.$new(true);
scope.isBadgePopupOpen = false;
scope.isPopupOpen = false;
eventScopes[scopeKey] = scope;
eventDuplicateCounts[eid] = sameEventCounts[eid];
}
scope.eventData = getEventFromId(eid);
if (scope.eventData) {
var isChange = !!scope.eventData.change;
var isCurrChange = isChange && scope.eventData.timeline_section === CURR_CHANGE_SECTION;
var isMultiEvent = scope.eventData.is_multievent;
var isPhantomEvent = scope.eventData.is_phantom;
var isSingleEventPhantom = isPhantomEvent && scope.eventData.events.length === 1;
}
if (isMultiEvent) {
if (scope.eventData.timeline_section === BLACKOUT_SECTION)
scope.schedulesTitle = LBL_BLACKOUT_SCHEDULES;
else if (scope.eventData.timeline_section === MAINT_SECTION)
scope.schedulesTitle = LBL_MAINTENANCE_SCHEDULES;
if (createNewScope) {
scope.openBadgePopup = function () {
if (!scope.isPopupOpen)
scope.isBadgePopupOpen = true;
};
scope.closeBadgePopup = function () {
scope.isBadgePopupOpen = false;
};
scope.$watch('isPopupOpen', function (open) {
if (open) {
scope.closeBadgePopup();
}
});
}
}
if (isPhantomEvent) {
if (scope.eventData.type === BLACKOUT_TYPE)
scope.schedulesTitle = LBL_BLACKOUT_SCHEDULES;
else if (scope.eventData.type === MAINT_TYPE)
scope.schedulesTitle = LBL_MAINTENANCE_SCHEDULES;
else if (scope.eventData.type === BOTH_TYPE)
scope.schedulesTitle = LBL_BOTH_SCHEDULES;
if (isSingleEventPhantom) {
scope.eventData = scope.eventData.events[0];
}
}
if (createNewScope) {
if (isChange) {
scope.canShowAssignedTo = function () {
if ($scope.viewMode === CalendarView.DAY)
return $scope.filters.dayView.assignee;
else if ($scope.viewMode === CalendarView.WEEK)
return $scope.filters.weekView.assignee;
return true;
};
scope.canShowGroup = function () {
if ($scope.viewMode === CalendarView.DAY)
return $scope.filters.dayView.group;
else if ($scope.viewMode === CalendarView.WEEK)
return $scope.filters.weekView.group;
return true;
};
scope.canShowShortDescription = function () {
if ($scope.viewMode === CalendarView.DAY)
return $scope.filters.dayView.shortDescription;
else if ($scope.viewMode === CalendarView.WEEK)
return $scope.filters.weekView.shortDescription;
return true;
};
scope.canShowDateTime = function () {
if ($scope.viewMode === CalendarView.DAY)
return $scope.filters.dayView.dateTime;
else if ($scope.viewMode === CalendarView.WEEK)
return $scope.filters.weekView.dateTime;
return true;
};
} else {
scope.openScheduleForm = function (sysId) {
scope.isPopupOpen = false;
go.toFormModal('cmn_schedule', sysId, {
title: i18n.getMessage('Schedule Form')
});
};
}
}
var isEditableChange = isCurrChange && $scope.isUpdatable === 'true';
if (isEditableChange && createNewScope) {
scope.close = function () {
scope.isPopupOpen = false;
};
editableChangePopupClosers[scopeKey] = scope.close;
scope.update = function () {
scope.updating = true;
vcabDataSource.change.update({
sys_id: scope.eventData.change.sys_id.value,
start_date: dataUtil.jsToWsDate(scope.dates.start),
end_date: dataUtil.jsToWsDate(scope.dates.end)
}).then(function (change) {
scope.updating = false;
scope.close();
if (isCurrChange) {
$scope.change = change;
scope.changeWillUpdate = true;
}
}, function () {
scope.updating = false;
scope.close();
});
};
scope.$watch('isPopupOpen', function (open) {
if (open) {
$scope.closeEditableChangePopups(scopeKey);
if (scope.unsavedDates)
scope.dates = scope.unsavedDates;
else {
scope.dates = {
start: scope.eventData.change.start_date,
end: scope.eventData.change.end_date
};
}
} else {
if (scope.unsavedDates) {
scope.unsavedDates = undefined;
if (!scope.changeWillUpdate) {
angular.extend(scope.eventData, changeToEvent(scope.eventData.change, scope.eventData.timeline_section));
updateEvent(scope.eventData.id);
}
}
}
});
}
if (needsCompilation) {
if (scope.eventData) {
if (isChange) {
if (isEditableChange)
$this.attr('uib-popover-template', '"cab_editable_change_event_popover.html"');
else
$this.attr('uib-popover-template', '"cab_readonly_change_event_popover.html"');
} else if (isMultiEvent || (isPhantomEvent && !isSingleEventPhantom))
$this.attr('uib-popover-template', '"cab_multi_window_event_popover.html"');
else
$this.attr('uib-popover-template', '"cab_window_event_popover.html"');
$this.attr('popover-class', 'cab_change_calendar_popover');
$this.attr('popover-placement', 'auto');
$this.attr('popover-append-to-body', 'true');
$this.attr('popover-is-open', 'isPopupOpen');
$this.attr('popover-trigger', 'click outsideClick');
$this.attr('popover-animation', 'false');
$this.css('cursor', 'pointer');
$compile(this)(scope);
}
}
});
garbageCollectOldEventScopes();
defer.resolve();
}, 100);
return defer.promise;
}
function garbageCollectOldEventScopes() {
for (var scopeKey in eventScopes) {
var s = eventScopes[scopeKey];
var id = scopeKey.split(':')[0];
var count = parseInt(scopeKey.split(':')[1]);
var maxCount = eventDuplicateCounts[id] || 0;
var e = getEventFromId(id);
var destroy = false;
if (s && !e) {
destroy = true;
eventDuplicateCounts[id] = 0;
} else if (s && e && count > maxCount) {
destroy = true;
}
if (destroy) {
s.$destroy();
eventScopes[scopeKey] = undefined;
if (editableChangePopupClosers[scopeKey])
editableChangePopupClosers[scopeKey] = undefined;
}
}
}
function getFirstScope(ev) {
return eventScopes[ev.id + ':1'];
}
var isRelatedSectionOpen = true;
function setVerticalUnits(currChangeLabel, showBlackoutSection, showMaintSection, showRelatedSection) {
var sections = [];
if (showBlackoutSection)
sections.push({key: BLACKOUT_SECTION, label: getWindowLabel(LBL_BLACKOUT_SCHEDULE)});
if (showMaintSection)
sections.push({key: MAINT_SECTION, label: getWindowLabel(LBL_MAINTENANCE_SCHEDULE)});
sections.push({key: CURR_CHANGE_SECTION, label: currChangeLabel});
if (showRelatedSection)
sections.push({key: RELATED_CHANGE_SECTION, label: i18n.getMessage('Related Changes'), open: isRelatedSectionOpen, children: $scope.relatedChangeLabels});
$scope.config.timeline.verticalUnits = sections;
compileTimelineLabels();
}
$scope.events = [];
$scope.phantomEvents = {};
$scope.relatedChangeLabels = [];
$scope.ready = false;
$scope.verticalUnits = null;
if (!$scope.configDescription)
$scope.configDescription = i18n.getMessage('Set filters to choose how related Changes are discovered.');
$scope.config = {
date: dataUtil.currentDateAsPerUserProfile(),
allowCreate: false,
allowResize: $scope.isUpdatable === 'true',
allowMoving: $scope.isUpdatable === 'true',
weekStartDay: calendarUtils.getNormalizedWeekStartDay(dataUtil.getFirstDayOfWeek()),
viewTimeFormat: '%H:%i',
timeline: {
displayButtonInUI: false,
enabled: true,
support: true,
property: {
value: 'timeline_section'
},
renderType: TimelineView.TREE,
section_autoheight: false,
dy: 68,
dx: 215,
event_dy: 'full',
folder_dy: 23
},
xy: {
scale_height: 36,
day_scale_height: 30
},
templates: {
week_scale_date: function (date, mode, schedulerInstance, jumptoAttr) {
return "<a href='#' " + jumptoAttr + ">" + schedulerInstance.date.date_to_str("%j %D")(date) + "</a>";
},
event_class: function (start, end, ev) {
var c;
if (ev.timeline_section === BLACKOUT_SECTION)
c = "cab_blackout_event cab_window_event";
else if (ev.timeline_section === MAINT_SECTION)
c = "cab_maint_event cab_window_event";
else if (ev.timeline_section === CURR_CHANGE_SECTION)
c = "cab_current_change_event cab_change_event";
else
c = "cab_related_change_event cab_change_event";
c += " cab_event";
if (viewStartDate && ev.start_date.getTime() < viewStartDate.getTime()) {
c += " cab_event_extends_left";
}
if (viewEndDate && ev.end_date.getTime() > viewEndDate.getTime()) {
c += " cab_event_extends_right";
}
if (ev.is_multievent)
c += " cab_multievent";
if (ev.change) {
if (!ev.hasOwnProperty('change')) {
c += " cab_event_extends_right";
if (!ev._first_chunk)
c += " cab_event_extends_left";
Object.getPrototypeOf(ev)._hasDummyCopy = true;
} else {
if (ev._hasDummyCopy)
c += " cab_event_extends_left";
ev._hasDummyCopy = false;
}
}
return c;
},
month_date_class: function (date) {
var key = getPhantomKey(date);
var ev = $scope.phantomEvents[key];
if (ev) {
var c;
if (ev.type === BLACKOUT_TYPE)
c = "cab_blackout_event cab_window_event";
else if (ev.type === MAINT_TYPE)
c = "cab_maint_event cab_window_event";
else if (ev.type === BOTH_TYPE)
c = "cab_blackout_event cab_maint_event cab_window_event";
c += " cab_event";
return c;
}
return '';
},
month_day: function (date, schedulerInstance, jumptoAttr) {
var dateToStr_func = schedulerInstance.date.date_to_str(schedulerInstance.config.month_day);
var d = dateToStr_func(date);
var key = getPhantomKey(date);
var ev = $scope.phantomEvents[key];
if (ev)
return "<a class='event_details month_date' event_id='" + ev.id + "' " + jumptoAttr + " href='#'>"  + d + "</a>";
else
return "<a class='month_date' " + jumptoAttr + " href='#'>" + d + "</a>";
},
event_bar_date: function (start, end, ev) {
return '';
},
tooltip_text: function (start, end, ev) {
var t = dataUtil.dateRangeToFriendlyText(start, end);
if (ev.schedule) {
if (ev.timeline_section === BLACKOUT_SECTION)
t += "<p>" + LBL_BLACKOUT_SCHEDULE + "</p>";
else
t += "<p>" + LBL_MAINTENANCE_SCHEDULE + "</p>";
} else if (ev.is_multievent) {
if (ev.timeline_section === BLACKOUT_SECTION)
t += "<p>" + LBL_MULTIPLE_BLACKOUT_SCHEDULES + "</p>";
else
t += "<p>" + LBL_MULTIPLE_MAINTENANCE_SCHEDULES + "</p>";
} else if (ev.change)
t += "<p>" + ev.change.short_description.display_value + "</p>";
return t;
}
},
mode: CalendarView.DAY,
readOnly: false
};
function isReady() {
if (el.height() === 0) {
$timeout(isReady, 300);
return;
}
$scope.ready = true;
}
isReady();
var loadingCallsCounter = 0;
$scope.enableLoading = function () {
$scope.isLoading = true;
loadingCallsCounter++;
};
$scope.disableLoading = function () {
if (loadingCallsCounter === 0)
return;
loadingCallsCounter--;
if (loadingCallsCounter === 0)
$scope.isLoading = false;
};
setVerticalUnits(i18n.getMessage('No change selected'));
$scope.viewMode = $scope.config.mode;
$scope.onViewChange = function (newView) {
var oldView = $scope.viewMode;
$scope.viewMode = newView;
$scope.closeEditableChangePopups();
if (newView === CalendarView.DAY || newView === CalendarView.WEEK) {
$scope.config.timeline.enabled = true;
if (oldView === CalendarView.MONTH)
buildEventArr();
fetchRelatedChanges();
} else if (newView === CalendarView.MONTH) {
$scope.config.timeline.enabled = false;
buildEventArr();
}
};
$scope.onAfterViewChange = function () {
if ($scope.viewMode === CalendarView.DAY || $scope.viewMode === CalendarView.WEEK)
compileTimelineLabels();
refreshEventsText();
addPopoversToEventsIfNeeded();
};
var viewStartDate;
var viewEndDate;
$scope.onDateRangeChange = function (start, end) {
viewStartDate = start;
viewEndDate = end;
$scope.closeEditableChangePopups();
if ($scope.viewMode !== CalendarView.MONTH)
buildEventArrIfNotAlreadyBuilt();
buildMarkedSpans();
addPopoversToEventsIfNeeded();
};
$scope.onFolderToggle = function (isOpen) {
compileTimelineLabels();
addPopoversToEventsIfNeeded();
isRelatedSectionOpen = isOpen;
};
$scope.onBeforeTooltip = function (ev) {
return false;
};
$scope.onBeforeDrag = function (ev) {
if (ev.change)
return $scope.viewMode === CalendarView.DAY && ev.timeline_section === CURR_CHANGE_SECTION;
else
return false;
};
var isLastDragCancelled;
$scope.onBeforeEventChanged = function (ev, originalEv) {
isLastDragCancelled = true;
if (ev.timeline_section !== originalEv.timeline_section)
return false;
var ctrl = getCommonCalCtrl();
if (ctrl) {
var extraGapInMs = 10 / ctrl.getEstimatedPxPerMs();
if (ev.end_date.getTime() < (viewStartDate.getTime() + extraGapInMs))
return false;
if (ev.start_date.getTime() > (viewEndDate.getTime() - extraGapInMs))
return false;
}
isLastDragCancelled = false;
return true;
};
$scope.onDragEnd = function (ev) {
var showPopup = !isLastDragCancelled;
compileTimelineLabels();
addPopoversToEventsIfNeeded().then(function () {
if (showPopup) {
var scope = getFirstScope(ev);
if (scope) {
scope.unsavedDates = {
start: ev.start_date,
end: ev.end_date
};
scope.isPopupOpen = true;
}
}
});
};
$scope.$watch('events', function () {
buildMarkedSpans();
compileTimelineLabels();
addPopoversToEventsIfNeeded();
});
var editableChangePopupClosers = {};
$scope.closeEditableChangePopups = function (exceptWithScopeKey) {
for (var k in editableChangePopupClosers) {
if (k === exceptWithScopeKey)
continue;
if (editableChangePopupClosers[k])
editableChangePopupClosers[k]();
}
};
var currentChangeEvent;
var currentChangeLabel;
$scope.enableLoading();
$scope.$watch('change', function (currentChange) {
if (currentChange) {
currentChange = angular.extend({}, currentChange);
currentChangeEvent = changeToEvent(currentChange, CURR_CHANGE_SECTION);
currentChangeLabel = getChangeLabel(currentChange);
$scope.disableLoading();
setVerticalUnits(currentChangeLabel, true, true);
if (currentChange.start_date)
$scope.config.date = new Date(currentChange.start_date.getTime());
$scope.events = [currentChangeEvent];
$scope.fetchEvents(startDate, endDate);
} else {
setVerticalUnits(i18n.getMessage('No change selected'));
$scope.events = [];
}
$scope.ready = false;
isReady();
});
function mergeOverlappingWindowEvents(events) {
var rangeBuckets = [];
for (var i = 0; i < events.length; i++) {
var e = events[i];
var eligibleBuckets = [];
for (var j = 0; j < rangeBuckets.length; j++) {
var b = rangeBuckets[j];
if (calendarUtils.testRangesIntersect(e.start_date, e.end_date, b.start, b.end))
eligibleBuckets.push(j);
}
var targetB = {
events: [e],
start: e.start_date,
end: e.end_date
};
rangeBuckets.push(targetB);
for (j = eligibleBuckets.length - 1; j >= 0; j--) {
var currB = rangeBuckets[eligibleBuckets[j]];
if (targetB.start.getTime() > currB.start.getTime())
targetB.start = currB.start;
if (targetB.end.getTime() < currB.end.getTime())
targetB.end = currB.end;
targetB.events = dataUtil.mergeSortedArrays(targetB.events, currB.events, function (e1, e2) {
return e1.start_date.getTime() - e2.start_date.getTime();
});
rangeBuckets.splice(eligibleBuckets[j], 1);
}
}
return rangeBuckets.map(function (b) {
if (b.events.length > 1) {
var leaderEvent = b.events[0];
var id = b.events.map(function (e) { return e.id }).join(',');
return {
id: id,
start_date: b.start,
end_date: b.end,
text: getWindowEventText(id, b.events, b.start, b.end, leaderEvent.timeline_section),
is_multievent: true,
events: b.events,
timeline_section: leaderEvent.timeline_section
};
} else {
return b.events[0];
}
});
}
function buildPhantomEventMap() {
$scope.phantomEvents = {};
var events = [];
if ($scope.blackoutSchedules && $scope.blackoutSchedules.length)
events = events.concat($scope.blackoutSchedules);
if ($scope.maintenanceSchedules && $scope.maintenanceSchedules.length)
events = events.concat($scope.maintenanceSchedules);
events.forEach(function (e) {
calendarUtils.getAllDaysInDateRange(e.start_date, e.end_date).forEach(function (d) {
var key = getPhantomKey(d);
var pe = $scope.phantomEvents[key];
if (!pe) {
pe = {
id: uid(),
date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
is_phantom: true,
type: undefined,
events: []
};
$scope.phantomEvents[key] = pe;
}
if (e.timeline_section === BLACKOUT_SECTION) {
if (!pe.type)
pe.type = BLACKOUT_TYPE;
else if (pe.type === MAINT_TYPE)
pe.type = BOTH_TYPE;
} else if (e.timeline_section === MAINT_SECTION) {
if (!pe.type)
pe.type = MAINT_TYPE;
else if (pe.type === BLACKOUT_TYPE)
pe.type = BOTH_TYPE;
} else
throw 'Programming error! Only schedule type events are expected here.';
pe.events.push(e);
});
});
}
function getCurrentEventBuildMarker() {
if (viewStartDate)
return viewStartDate.getTime() + $scope.viewMode;
return undefined;
}
function buildEventArrIfNotAlreadyBuilt() {
if (eventBuildMarker === getCurrentEventBuildMarker())
return;
buildEventArr();
}
var eventBuildMarker;
function buildEventArr() {
if (currentChangeEvent) {
$scope.events = [currentChangeEvent];
if ($scope.viewMode !== CalendarView.MONTH) {
$scope.relatedChangeLabels = [];
var evs;
if ($scope.blackoutSchedules && $scope.blackoutSchedules.length) {
evs = $scope.blackoutSchedules;
evs = mergeOverlappingWindowEvents(evs);
$scope.events = $scope.events.concat(evs);
}
if ($scope.maintenanceSchedules && $scope.maintenanceSchedules.length) {
evs = $scope.maintenanceSchedules;
evs = mergeOverlappingWindowEvents(evs);
$scope.events = $scope.events.concat(evs);
}
if ($scope.relatedChanges && $scope.relatedChanges.length) {
evs = $scope.relatedChanges.filter(function (e) {
if (!viewStartDate)
return false;
if (e.end_date.getTime() > viewStartDate.getTime() && e.start_date.getTime() < viewEndDate.getTime()) {
$scope.relatedChangeLabels.push({
key: e.timeline_section,
label: getChangeLabel(e.change)
});
return true;
}
return false;
});
setVerticalUnits(currentChangeLabel, true, true, evs.length > 0);
$scope.events = $scope.events.concat(evs);
} else {
setVerticalUnits(currentChangeLabel, true, true, false);
}
} else {
buildPhantomEventMap();
}
} else {
$scope.blackoutSchedules = [];
$scope.maintenanceSchedules = [];
$scope.relatedChanges = [];
$scope.relatedChangeLabels = [];
setVerticalUnits(currentChangeLabel, true, true, false);
$scope.events = [];
}
eventBuildMarker = getCurrentEventBuildMarker();
}
function buildMarkedSpans() {
if (currentChangeEvent) {
var c = 'current_change_span_mark';
if (viewStartDate && currentChangeEvent.start_date.getTime() < viewStartDate.getTime())
c += ' left_extends_beyond';
if (viewEndDate && currentChangeEvent.end_date.getTime() > viewEndDate.getTime())
c += ' right_extends_beyond';
$scope.markedSpans = [{
start_date: currentChangeEvent.start_date,
end_date: currentChangeEvent.end_date,
type: 'current_change_marker',
css: c
}];
return;
}
$scope.markedSpans = [];
}
var startDate;
var endDate;
$scope.fetchEvents = function (start, end) {
startDate = start;
endDate = end;
fetchWindows();
if ($scope.viewMode !== CalendarView.MONTH)
fetchRelatedChanges();
};
var windowFetchPromise;
function fetchWindows() {
if (windowFetchPromise) {
windowFetchPromise.cancel();
$scope.disableLoading();
}
if (!currentChangeEvent) {
return;
}
if (!startDate) {
return;
}
var start = calendarUtils.getStartOfPreviousDay(startDate);
var end = calendarUtils.getStartOfNextDay(endDate);
$scope.enableLoading();
windowFetchPromise = cancellablePromise(vcabDataSource.change.getRelatedWindows(currentChangeEvent.id, start, end));
windowFetchPromise.then(function (data) {
$scope.blackoutSchedules = [];
$scope.maintenanceSchedules = [];
data.maintenance.forEach(function (m) {
$scope.maintenanceSchedules = $scope.maintenanceSchedules.concat(scheduleToEvents(m, MAINT_SECTION));
});
data.blackout.forEach(function (b) {
$scope.blackoutSchedules = $scope.blackoutSchedules.concat(scheduleToEvents(b, BLACKOUT_SECTION));
});
if (data.warn_invalid_conflict_checker)
$scope.onWarn({
$msg: i18n.getMessage('The ChangeCheckConflicts script include has been modifed and does not contain the required API. Cannot collect maintenance and blackout schedules. Please contact system administrator.')
});
buildEventArr();
$scope.disableLoading();
}, function () {
$scope.blackoutSchedules = [];
$scope.maintenanceSchedules = [];
buildEventArr();
$scope.disableLoading();
});
}
var relatedChangeFetchPromise;
function fetchRelatedChanges() {
if (relatedChangeFetchPromise) {
relatedChangeFetchPromise.cancel();
$scope.disableLoading();
}
if (!currentChangeEvent) {
return;
}
if (!startDate) {
return;
}
if ($scope.filters.config.assignee || $scope.filters.config.group || $scope.filters.config.ci) {
$scope.enableLoading();
relatedChangeFetchPromise = cancellablePromise(vcabDataSource.change.getRelatedChanges($scope.change.sys_id.value,
startDate, endDate, $scope.filters.config.assignee, $scope.filters.config.group, $scope.filters.config.ci));
relatedChangeFetchPromise.then(function (changes) {
var sectionId = RELATED_CHANGE_SECTION;
$scope.relatedChanges = changes.map(function (change) {
sectionId += 10;
return changeToEvent(change, sectionId);
});
buildEventArr();
$scope.disableLoading();
}, function () {
$scope.relatedChanges = [];
buildEventArr();
$scope.disableLoading();
});
} else {
$scope.relatedChanges = [];
buildEventArr();
}
}
function setAllAndNone(c) {
var score = 0;
var total = 0;
for (var k in  c) {
if (k === ALL_FILTER || k === NONE_FILTER)
continue;
total++;
if (c[k])
score++;
}
if (total === 0)
return;
c.all = false;
c.none = false;
if (score === total)
c.all = true;
if (score === 0)
c.none = true;
}
if (!$scope.configOptions)
$scope.configOptions = {};
if (!$scope.dayViewOptions)
$scope.dayViewOptions = {};
if (!$scope.weekViewOptions)
$scope.weekViewOptions = {};
$scope.filters = {
config: $scope.configOptions,
dayView: $scope.dayViewOptions,
weekView: $scope.weekViewOptions,
tabSelection: $scope.SETTINGS_TAB
};
if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
var q = $q.all(
[userPreferences.getPreference('cab_workbench.day_view_options'),
userPreferences.getPreference('cab_workbench.week_view_options'),
userPreferences.getPreference('cab_workbench.config_options')]
);
q.then(function (r) {
$scope.dayViewOptions = {
dateTime: true,
number: true,
shortDescription: true,
assignee: true,
group: true
};
$scope.filters.dayView = angular.extend($scope.dayViewOptions, deserializeObj(r[0]));
$scope.weekViewOptions = {
dateTime: true,
number: true,
shortDescription: true
};
$scope.filters.weekView = angular.extend($scope.weekViewOptions, deserializeObj(r[1]));
$scope.configOptions = {
assignee: false,
group: false,
ci: true
};
$scope.filters.config = angular.extend($scope.configOptions, deserializeObj(r[2]));
});
} else {
$scope.filters.config.ci = true;
$scope.filters.dayView.all = true;
$scope.filters.weekView.all = true;
}
$scope.$watch('filters.config.all', function (all) {
if (all) {
$scope.filters.config.none = false;
$scope.filters.config.assignee = true;
$scope.filters.config.group = true;
$scope.filters.config.ci = true;
}
});
$scope.$watch('filters.config.none', function (none) {
if (none) {
$scope.filters.config.all = false;
$scope.filters.config.assignee = false;
$scope.filters.config.group = false;
$scope.filters.config.ci = false;
}
});
$scope.$watchGroup(['filters.config.assignee', 'filters.config.group', 'filters.config.ci'], function () {
setAllAndNone($scope.filters.config);
fetchRelatedChanges();
});
$scope.saveConfigOptions = function () {
if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
$timeout(function () {
var s = serializeObj($scope.configOptions);
if (s)
userPreferences.setPreference('cab_workbench.config_options', s);
});
}
};
$scope.$watch('filters.dayView.all', function (all) {
if (all) {
$scope.filters.dayView.none = false;
$scope.filters.dayView.dateTime = true;
$scope.filters.dayView.number = true;
$scope.filters.dayView.shortDescription = true;
$scope.filters.dayView.assignee = true;
$scope.filters.dayView.group = true;
}
});
$scope.$watch('filters.dayView.none', function (none) {
if (none) {
$scope.filters.dayView.all = false;
$scope.filters.dayView.dateTime = false;
$scope.filters.dayView.number = false;
$scope.filters.dayView.shortDescription = false;
$scope.filters.dayView.assignee = false;
$scope.filters.dayView.group = false;
}
});
$scope.$watchGroup(['filters.dayView.dateTime',
'filters.dayView.number',
'filters.dayView.shortDescription',
'filters.dayView.assignee',
'filters.dayView.group'], function () {
setAllAndNone($scope.filters.dayView);
refreshEventsText(true);
});
$scope.saveDayViewOptions = function () {
if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
$timeout(function () {
var s = serializeObj($scope.dayViewOptions);
if (s)
userPreferences.setPreference('cab_workbench.day_view_options', s);
});
}
};
$scope.$watch('filters.weekView.all', function (all) {
if (all) {
$scope.filters.weekView.none = false;
$scope.filters.weekView.dateTime = true;
$scope.filters.weekView.number = true;
$scope.filters.weekView.shortDescription = true;
}
});
$scope.$watch('filters.weekView.none', function (none) {
if (none) {
$scope.filters.weekView.all = false;
$scope.filters.weekView.dateTime = false;
$scope.filters.weekView.number = false;
$scope.filters.weekView.shortDescription = false;
}
});
$scope.$watchGroup(['filters.weekView.dateTime',
'filters.weekView.number',
'filters.weekView.shortDescription'], function () {
setAllAndNone($scope.filters.weekView);
refreshEventsText(true);
});
$scope.saveWeekViewOptions = function () {
if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
$timeout(function () {
var s = serializeObj($scope.weekViewOptions);
if (s)
userPreferences.setPreference('cab_workbench.week_view_options', s);
});
}
};
$scope.$on('$destroy', function () {
$scope.events = [];
garbageCollectOldEventScopes();
});
}
};
});
} (jQuery));
;
;
