(function executeRule(current, previous /*null when async*/ ) {
    var multilingualGr = new GlideRecord("ais_country_to_search_language");
    multilingualGr.addQuery('country', current.country);
    multilingualGr.addQuery('language', current.language);
    multilingualGr.addQuery('sys_id', '!=', current.sys_id);
    multilingualGr.query();

    if (multilingualGr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("A record with Country: {0}, Search language: {1} already exists", [current.country, current.language]));
        current.setAbortAction(true);
        gs.setRedirect(current.getLink(true));
    }

})(current, previous);
