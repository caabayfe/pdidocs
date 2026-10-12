/**
 * Set specific configuration properties and event registration for displaying this timeline.
 * The JavaScript timeline variable is already defined as:
 *
 *   var glideTimeline; (typeof GlideTimeline)
 *
 * For a list of available functions, please visit:
 *   http://docs.servicenow.com/?context=Schedule_Pages
 */
glideTimeline.useTimelineItemId = true;

glideTimeline.showLeftPane(true);
glideTimeline.showLeftPaneAsTree(true);
glideTimeline.showTimelineText(true);
glideTimeline.showDependencyLines(true);
glideTimeline.groupByParent(true);
glideTimeline.showSummaryPane(true);
glideTimeline.setAutoRefresh(60);
glideTimeline.showProjectGanttPanes(true);
glideTimeline.setDefaultPointIconClass('blue_circle');
glideTimeline.registerEvent('getItems', 'SLATimeline');
