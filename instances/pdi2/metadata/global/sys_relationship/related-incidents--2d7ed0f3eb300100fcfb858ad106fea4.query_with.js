var parentQuery = 'sys_id='+parent.source_incident;
var childrenQueryFromParent = 'parentISNOTEMPTY^parent=' + parent.source_incident;
var childrenQueryFromParentIncident  = 'parent_incidentISNOTEMPTY^parent_incident=' + parent.source_incident;

/**
  If the 'parent_incident' field is available then 
    - use both 'parent' and 'parent_incident' in the query, 
	- otherwise just use parent in the query
**/

if (current.isValidField('parent_incident'))
	current.addEncodedQuery(parentQuery + '^NQ' + childrenQueryFromParent + '^NQ' + childrenQueryFromParentIncident);
else
	current.addEncodedQuery(parentQuery + '^NQ' + childrenQueryFromParent);
