var DICTIONARY_TABLE = 'sys_dictionary';
var BADGE_COUNT_TABLE = 'sys_sg_badge_count';
function updateRequiredAppletLauncherToFalse() {
	gs.info("updateRequiredAppletLauncherToFalse started");
    var gr = new GlideRecord(DICTIONARY_TABLE);
    gr.addQuery('name', BADGE_COUNT_TABLE);
    gr.addQuery('element', 'applet_launcher');
    gr.query();
    if (gr.next()) {
        gr.setValue('mandatory', 'false');
        gr.update();
		gs.info("updateRequiredAppletLauncherToFalse completed");
    }
}
function updateDefaultValueOfLocationChoice() {
	gs.info("updateDefaultValueOfLocationChoice started.");
	var gr = new GlideRecord(DICTIONARY_TABLE);
    gr.addQuery('name', BADGE_COUNT_TABLE);
	gr.addQuery('element', 'location');
	gr.query();
    if (gr.next()) {
        gr.setValue('default_value', 'header_function');
        gr.update();
		gs.info("updateDefaultValueOfLocationChoice completed.");
    }
}
gs.info("Update of sys_sg_badge_count for NavTab started.");
updateRequiredAppletLauncherToFalse();
updateDefaultValueOfLocationChoice();
gs.info("Update of sys_sg_badge_count for NavTab completed.");
