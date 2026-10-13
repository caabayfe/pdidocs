var sourceInc = parent.source_incident; //Source incident of the current incident alert
var prbIDs = "";						//Comma-seperated string of problem sys_ids for query

if (JSUtil.notNil(sourceInc.problem_id))
	prbIDs += sourceInc.problem_id + ",";

var inc = getChildIncidents(sourceInc);

/*
 * Construct a list of problem sys_ids based on any incidents that are related
 * to the current incident alert's source incident
 */

while (inc.next()) {
	if (JSUtil.notNil(inc.problem_id))
		prbIDs += inc.problem_id + ",";
}

current.addQuery("sys_id", "IN", prbIDs);

/**
  returns all the child incidents of the provided parent incident
  
	If the 'parent_incident' field is available then 
    - uses both 'parent' and 'parent_incident' in the query, 
	- otherwise just uses parent in the query
	
**/
function getChildIncidents(parentInc){

	var childrenQueryFromParent = 'parentISNOTEMPTY^parent=' + parentInc;
	var childrenQueryFromParentIncident  = 'parent_incidentISNOTEMPTY^parent_incident=' + parentInc;
	
	var incidents = new GlideRecord('incident');
	
	if (incidents.isValidField('parent_incident'))
		incidents.addEncodedQuery(childrenQueryFromParent + '^NQ' + childrenQueryFromParentIncident);
	else
		incidents.addEncodedQuery(childrenQueryFromParent);
	
	incidents.query();
	
	return incidents;
}
