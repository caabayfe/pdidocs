
//run only on upgrades
if (!pm.isZboot()) {
    new TranslationUtils().convert("sys_ux_form_action", ["name"]);
    gs.info('sys_ux_form_action.name internal type changed to "translated_text"');
}
