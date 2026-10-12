// create intial content of a Guided Setup
var gs_plugin = event.parm1.toString();
var gr = new GlideRecord('gsw_content_group');
gr.addQuery('sys_package.source', gs_plugin);
gr.query('is_root_content', true);
if (gr.next()) {
    var title = gr.title.toString();
    var rootContentId = gr.sys_id.toString();
    var util = new sn_guided_setup.GuidedSetupPublicUtilSNC();
    gs.info('****Begin creation of status records for ' + title + ' content**** from script action.');
    util.createInitialStatusForRoutine(rootContentId);
    gs.info('****End creation of status records for ' + title + ' content**** from script action.');
} else
    gs.info('Unable to create content for ' + gs_plugin + '. Cannot find root content.');
