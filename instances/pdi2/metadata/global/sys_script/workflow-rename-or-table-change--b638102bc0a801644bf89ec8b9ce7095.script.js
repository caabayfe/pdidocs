/**
 * Rename the workflow if our name was changed for a published or checked out by me workflow version
 * Copy the table from the version if it changes.
 */
if ((current.published.toString() == 'true') || (current.checked_out_by.toString() == gs.userID())) {

   var gr = new GlideRecord('wf_workflow');
   if (gr.get(current.workflow)) {
      gr.name = current.name;
      gr.table= current.table;
      gr.update();
   }
}
