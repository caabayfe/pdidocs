cascadeDeleteUsers();

function cascadeDeleteUsers(){
	var rec = new GlideRecord("asmt_m2m_stakeholder");
	rec.addQuery("assessment_record", current.assessment_record);
	rec.addQuery("category_user.metric_category", current.category);
	rec.query();
	var str = "";
	while(rec.next()){
		str += rec.category_user.user.name;
		if(rec.hasNext())
			str += ', ';
		rec.deleteRecord();
	}
	
	if(rec.getRowCount() > 0)
		gs.addInfoMessage(gs.getMessage('The following users associated with "{0}" category have been removed from "{1}" record: {2}', [current.category.name, current.assessment_record.name, str]));
}
