g_scratchpad.evaluation_method = current.getValue("evaluation_method");
g_scratchpad._loadDisplayField = current.display_field;

g_scratchpad.displayAddCategoryFromBank = true;
if (current.chat_survey) {
  var category = new GlideRecord('asmt_metric_category');
  category.addQuery('metric_type', current.getUniqueValue());
  category.setLimit(1);
  category.query();
  if (category.next())
    g_scratchpad.displayAddCategoryFromBank = false;
}

var isReference = false;
if (current.table != '' && current.filter_table != '') {
	if (current.table != current.filter_table)
		isReference = true;
	else {
		var type = new GlideRecord(current.table);
		var refFieldType = current.getValue("display_field") !== "none" ? type.getElement(current.display_field).getED().getInternalType() : null;
		if (refFieldType == 'glide_list' || refFieldType == 'reference')
			isReference = true;
	}
}
g_scratchpad._loadDisplayIsReference = isReference;
g_scratchpad._loadDisplayAll = current.display_all_filters;
g_scratchpad._loadMetricDomain = (new AssessmentUtils()).getMetricDomain(current.sys_id + '');
g_scratchpad.state = current.getValue("publish_state");

// Check if current user is the owner of current survey
if ((current.survey_owners+"").indexOf(gs.getUserID()) == -1)
	g_scratchpad.isOwner = false;
else
	g_scratchpad.isOwner = true;
