/**
 Service-now.com
 
 Description: Set sys_portal.summary to match the title from sys_portal_preference
**/
setPortalSummary();

function setPortalSummary() {
   var gr = new GlideRecord('sys_portal');
   if (!gr.get(current.portal_section))
      return;

   gr.summary = current.value;
   gr.update();
}
