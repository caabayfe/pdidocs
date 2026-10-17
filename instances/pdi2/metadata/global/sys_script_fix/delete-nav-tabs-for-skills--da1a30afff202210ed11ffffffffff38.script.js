(function() {
    if (pm.isZboot())
        return;

    //Fetch all mapped search sources built on skills where exclude in search is true
    var skillSacs = [];

    if (gs.tableExists('ais_search_profile_ais_search_source_m2m')) {
        var linkedSources = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        linkedSources.addEncodedQuery('search_source.datasource.source=sys_gen_ai_skill^exclude_in_regular_search=true');
        linkedSources.query();

        //For each config that delete the corresponding NavTab Record
        while (linkedSources.next()) {
            skillSacs.push(linkedSources.search_source.sys_id);
        }
    }

    if (gs.tableExists('sys_search_filter') && skillSacs.length > 0) {

        var navTabGr = new GlideRecord('sys_search_filter');
        navTabGr.addEncodedQuery('ais_search_sourceIN' + skillSacs.join(','));
        navTabGr.query();

        navTabGr.deleteMultiple();
    }

}());
