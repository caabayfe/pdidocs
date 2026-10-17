// Delete Script Include with specific name and sys_id
var scriptIncludeGR = new GlideRecord('sys_script_include');
scriptIncludeGR.addQuery('sys_id', 'fac9415943511210b4cc43852db8f21d');
scriptIncludeGR.addQuery('name', 'GAICAttachmentUtils');
scriptIncludeGR.query();

if (scriptIncludeGR.next()) {
    scriptIncludeGR.setWorkflow(false);
    gs.info('Deleting Script Include: ' + scriptIncludeGR.name + ' (sys_id=' + scriptIncludeGR.sys_id + ')');
    scriptIncludeGR.deleteRecord();
}
