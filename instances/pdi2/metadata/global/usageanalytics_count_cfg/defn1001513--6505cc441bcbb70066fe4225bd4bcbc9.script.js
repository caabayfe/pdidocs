answer = getOAMSurvey();

/*
* Count the number of surveys that can be embedded in the Outlook email  
* plugin com.sn_ms_oam needs to be installed, otherwise ms_adaptive_cards field doesn't exist.
*/
function getOAMSurvey() {
    // check OAM Plugin installed
    if (!GlidePluginManager.isActive("com.sn_ms_oam"))
        return 0;
    
    var count = 0;
    var agg = new GlideAggregate('asmt_metric_type');
	if (!agg.isValid())
		return 0;
    agg.addEncodedQuery('evaluation_method=survey^active=true^notify_user=true^ms_adaptive_cards=true');
    agg.addAggregate('COUNT');
    agg.setWorkflow(false);
    agg.query();
          
    if (agg.next())
        count = agg.getAggregate('COUNT');

    return count;
}
