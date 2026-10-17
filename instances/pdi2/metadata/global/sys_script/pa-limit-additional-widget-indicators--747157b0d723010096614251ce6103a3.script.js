var agg = new GlideAggregate("pa_widget_indicators");
agg.addQuery("widget", "=", current.widget);
agg.addNullQuery('widget_indicator');	//Only include 1st tier additional indicators (parent related widget indicator=null)
agg.addAggregate("COUNT");
agg.query();
var answer = 0;
if (agg.next())
	answer = agg.getAggregate("COUNT");
var max = parseInt(gs.getProperty('com.snc.pa.widget.max_widget_indicators'), 10);
if (answer >= max && !current.widget_indicator) {  //Apply only on 1st tier, when widget_indicator is empty
	gs.addErrorMessage(gs.getMessage("Maximum number of widget indicators, in addition to the main indicator, that can be added to a widget has been reached."));
	current.setAbortAction(true);
}
