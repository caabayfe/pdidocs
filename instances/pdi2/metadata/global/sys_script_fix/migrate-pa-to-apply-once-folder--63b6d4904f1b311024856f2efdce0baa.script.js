if (!pm.isZboot()) {
    var PERFORMANCE_ANALYTICS_FILE_NAME = 'sys_app_application_00ede6001b120100763d91eebc07137f.xml';
    sn_applyonce.ApplyOnce.doNotUpdate(PERFORMANCE_ANALYTICS_FILE_NAME);
    gs.info('Following application Menus were migrated to apply_once folder:' + PERFORMANCE_ANALYTICS_FILE_NAME);
}
