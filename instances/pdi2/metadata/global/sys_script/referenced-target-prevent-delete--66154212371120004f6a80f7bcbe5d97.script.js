checkReferences();

function checkReferences() {
  var gr = new GlideAggregate("clone_instance");
  gr.setGroup(false);
  gr.addQuery("target_instance", current.sys_id);
  gr.addQuery("state", "!=", "Draft");
  gr.addAggregate("count", "sys_id");
  gr.query();
  if (!gr.next())
    return;

  var count = gr.getAggregate("count", "sys_id");
  if (gs.nil(count))
    return;

  if (count <= 0)
    return;

  gs.addErrorMessage("The current record cannot be deleted until all " + count + " instance clone records referencing it are deleted.");
  current.setAbortAction(true);
}
