/**
  * Expand the CIs with issues
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

expandNodesWithIssues(this);

function expandNodesWithIssues(node) {
   var ids = this.bsmMap.getParam('sticky_nodes');
		
   var issueIds = node.getData('annotation_incident_id');
   ids = appendIssueIds(ids, issueIds);
   issueIds = node.getData('annotation_problem_id');
   ids = appendIssueIds(ids, issueIds);
   issueIds = node.getData('annotation_change_request_id');
   ids = appendIssueIds(ids, issueIds);
   issueIds = node.getData('annotation_cmdb_ci_outage_id');
   ids = appendIssueIds(ids, issueIds);

   this.bsmMap.setParam('sticky_nodes', ids);
   this.bsmMap.load();
}

function appendIssueIds(ids, issueIds) {
   if (!issueIds)
      return ids;
 
   if (ids)
      ids += ',';

   return ids + issueIds;
}
