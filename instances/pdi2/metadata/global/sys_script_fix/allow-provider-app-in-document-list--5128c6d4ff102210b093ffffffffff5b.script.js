(function() {
    // important to do '' + to convert java string to js
    var permittedTablesProp = '' + GlidePropertiesDB.get('glide.ui.permitted_tables');
    if (!permittedTablesProp) {
        return;
    }
    if (permittedTablesProp.indexOf('sys_cs_provider_application') == -1) {
        var newPermittedTablesProp = permittedTablesProp + ",sys_cs_provider_application";
        gs.info('Updating property "glide.ui.permitted_tables" to "' + newPermittedTablesProp + '".');
        GlidePropertiesDB.set('glide.ui.permitted_tables', newPermittedTablesProp);
    }
})();
