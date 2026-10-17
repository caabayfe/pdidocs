/**
  * Script executed on the Client for this action
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 


var wfName = this.getData('name', '?');

var w = new GlideDialogWindow('subflow'); 

w.setPreference('renderer', 'RenderForm');
w.setPreference('type', 'direct');
w.setPreference('table', 'subflow');
w.setPreference('sysparm_subflow', 'true');
w.setPreference('sysparm_sys_id', this.getID());
w.render(); 
