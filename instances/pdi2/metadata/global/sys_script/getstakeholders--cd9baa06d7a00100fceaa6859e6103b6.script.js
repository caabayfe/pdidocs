getStakeholders(current);
	
function getStakeholders(record) {
	var grCatList = new GlideRecord("asmt_m2m_category_assessment");
	grCatList.addQuery('assessment_record', record.sys_id);
	grCatList.query();
	var catList = "";
	while (grCatList.next()) {
		if (!catList.isEmpty())
			catList += ",";
		catList += grCatList.getValue('category');
	}
	
    var gr = new GlideRecord('asmt_m2m_category_user');
	gr.addEncodedQuery('metric_categoryIN' + catList);
     gr.query();
    
    var users = [];
    while (gr.next())
        users.push(gr.sys_id.toString());
    lookup.addQuery("sys_id", "IN", users);
}
