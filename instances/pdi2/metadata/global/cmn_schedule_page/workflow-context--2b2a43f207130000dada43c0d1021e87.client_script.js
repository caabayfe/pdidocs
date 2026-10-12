/**
 * Set specific configuration properties and event registration for displaying this timeline. 
 * The JavaScript timeline variable is already defined as:
 *
 *   var glideTimeline; (typeof GlideTimeline)
 *
 * For a list of available functions, please visit:
 *   http://docs.servicenow.com/?context=Schedule_Pages
 */
glideTimeline.showLeftPane(true);
glideTimeline.showSummaryPane(true);
glideTimeline.showLeftPaneAsTree(true);
glideTimeline.sortByStartDate(true);
glideTimeline.showTimelineText(true);
glideTimeline.showDependencyLines(true);
glideTimeline.setReadOnly(false);
glideTimeline.setDefaultPointIconClass('blue_circle');
glideTimeline.groupByParent(true);
glideTimeline.registerEvent('getItems', 'WorkflowTimeline');
