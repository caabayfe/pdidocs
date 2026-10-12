/**
  * Expand the CIs that are collapsed into this node
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

expandNode(this);

function expandNode(node) {
   // redraw the bsm map with the new/additional list of expanded ids
   var diagram = node.diagram;
   var ids = diagram.getParam('sticky_nodes');
   if (ids.length > 0)
      ids += ',';

   var max = diagram.getData('glide.bsm.max_to_expand');
   var newNodes = node.getData("collapsed_ids").split(',');

   if (max == '' || newNodes.length < max - 1) {
      //expand all
      ids += node.getData("collapsed_ids"); }
   else {
      for (var i = 0; i < max; i++) {
         ids += newNodes[i]; 
         if (i < max - 1) 
            ids += ',';         
      } 
   }
   diagram.setParam('sticky_nodes', ids);
   diagram.load();
   return true;
}
