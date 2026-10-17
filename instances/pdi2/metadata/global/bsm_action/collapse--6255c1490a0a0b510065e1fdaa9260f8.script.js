/**
  * Collapse the CIs that were recently expanded. 
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

var stickyList = this.diagram.getParam('sticky_nodes').split(','); 

collapseNodes(this);

function collapseNodes(clickedNode) {
   var diagram = clickedNode.diagram;
   var nodes = diagram.nodes;  
   
   for (key in nodes) {
      var node = nodes[key];
      if (node.getData("is_expanded")=="true") {
         removeStickyNode(node.getID());     
      }     
   } 

   diagram.setParam('sticky_nodes', stickyList.join(','));
   diagram.load();
   return true;
}

function removeStickyNode(nodeID) {
   for (var i = 0; i < stickyList.length; i++) {
      var node = stickyList[i]; 
      if (node == nodeID) 
         stickyList.splice(i, 1); 
   } 
}
