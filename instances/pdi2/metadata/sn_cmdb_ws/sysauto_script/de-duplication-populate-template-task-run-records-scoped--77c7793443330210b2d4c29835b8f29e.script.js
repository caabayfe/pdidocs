/**
 * DO NOT clone this scheduled job. It will not increase the performance in any way.
 */

// Check if the old 'De-duplication: Populate Template Task Run Records' scheduled job is still active and running, and if not, disable it
var gr = new GlideRecord('sysauto_script');
gr.addQuery('sys_id', '1e27a3945b31211006447da52d81c7f9');
gr.addActiveQuery();
gr.query();
if (gr.next()) {
    var triggerGr = new GlideRecord('sys_trigger');
    triggerGr.addQuery('document', 'sysauto_script');
    triggerGr.addQuery('document_key', '1e27a3945b31211006447da52d81c7f9');
    triggerGr.addQuery('state', 1);
    triggerGr.query();
    if (!triggerGr.hasNext()) {
        new global.GlideQuery('sysauto_script')
            .where('sys_id', '1e27a3945b31211006447da52d81c7f9')
            .update({
                active: false
            });
	}
} else {
    var populator = new ScopedTemplateTaskRunPopulator();
    populator.populateRecords();
}
