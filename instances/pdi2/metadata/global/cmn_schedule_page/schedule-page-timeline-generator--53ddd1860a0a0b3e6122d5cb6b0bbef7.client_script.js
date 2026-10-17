/**
 * Set specific configuration properties and event registration for displaying this timeline. 
 * The JavaScript timeline variable is already defined as:
 *
 *   var glideTimeline; (typeof GlideTimeline)
 *
 * For a list of available functions, please visit:
 *   http://docs.servicenow.com/?context=Schedule_Pages
 */
glideTimeline.showDependencyLines(true);
glideTimeline.groupByParent(true);

glideTimeline.showLeftPane(false);
glideTimeline.showLeftPaneAsTree(false);
glideTimeline.showTimelineText(true);
glideTimeline.setDefaultPointIconClass('blue_square');
glideTimeline.registerEvent('getItems', 'TimelineGeneratorSchedulePage');
glideTimeline.registerEvent('elementMoveX', 'TimelineGeneratorSchedulePage');
glideTimeline.registerEvent('elementTimeAdjustEnd', 'TimelineGeneratorSchedulePage');
glideTimeline.registerEvent('elementTimeAdjustStart', 'TimelineGeneratorSchedulePage');
