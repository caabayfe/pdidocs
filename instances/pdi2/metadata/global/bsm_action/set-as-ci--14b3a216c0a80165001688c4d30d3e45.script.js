/**
  * Set the current CI as the CI for the incident
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

var g_map_window = window.parent;
var g_opener_window = g_map_window.opener;
var g_opener = (g_opener_window && g_opener_window.GJSV? g_opener_window.getMainWindow() : null);

setAsCI(this);

function setAsCI(node) { 
   var ciId = node.getID();
   var ciName = node.getData('label');
   var field = node.diagram.getParam('ref');
   var g_form = g_opener.g_form;
   g_form.setValue(field, ciId, ciName);
   g_map_window.close();
}
