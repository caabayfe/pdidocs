/**
  * Show the tasks for this CI
  *
  * 'this' is a reference to the GwtDiagramNode (which is a GlideWindow) that the action was called from
  * Use 'this.diagram' to reference the GwtDiagram
 **/ 

openTaskLink(this.getID());

function openTaskLink(id) {
   var url = "task_list.do?sysparm_query=cmdb_ci=" + id;
   try {
      var width = 700;
      var height = 500;
      var features = "resizable=yes,scrollbars=yes";
      popupOpenFocus(url + "&sysparm_nameofstack=bsm", "bsm_view", width, height, features, true, false);
   } catch (e) {
      if (confirm("Parent window was closed. Shall I open this link in the current window?")) {
         var iam = self;
         if (iam.parent && iam.parent != iam)
            iam = iam.parent;
				
         iam.location = "nav_to.do?uri=" + url;
      }
   }
}
