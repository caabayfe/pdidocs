/**
  * Select the node and all of its parent and children (up and down the hierarchy)
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

highlightHierarchy(this);

function highlightHierarchy(node) {
   node.diagram.clearSelected();
   selectNode(node, "parent");
   selectHierarchy(node, "child");
}

function selectNode(node, direction) {
   // Already been here?
   if (node.isActive())
      return;

   node.setSelected(true);
   selectHierarchy(node, direction);
}

function selectHierarchy(node, direction) {
   var edges = node.diagram.getEdges();
   for (var id in edges) {
      var edge = node.diagram.getEdge(id);
      if ((direction == "parent") && (edge.getTarget().getID() == node.getID()))
         selectNode(edge.getSource(), direction);

      if ((direction == "child") && (edge.getSource().getID() == node.getID()))
         selectNode(edge.getTarget(), direction);
   }
}
