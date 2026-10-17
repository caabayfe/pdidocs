linkAssessableRecord(current);

function linkAssessableRecord(record) {
	if (current.metric_type) {
		if (current.metric_type.evaluation_method != "assessment" || gs.nil(record.table))
			record.table = current.metric_type.table;
		if (current.metric_type.evaluation_method != "assessment")
			record.filter = current.metric_type.condition;
	}
}
