gs.info("Data Import started");

var portals = ["Service Portal"];
var searchLogTable = "text_search";
var maxLogEntries = 500000;

var portalSysIds = this.getPortalSysIds(portals);
var builder = new BuildSuggestionsFromLogTable(maxLogEntries);

for (var i = 0; i < this.portalSysIds.length; i++) {
    var searchSourceIds = this.getSearchSourceIds(this.portalSysIds[i]);
    var searchSources = this.getSearchSources(searchSourceIds);

    builder.buildPortalSuggestions(this.portalSysIds[i], this.searchLogTable, searchSources, searchSourceIds);
}

gs.setProperty('glide.search.suggestions.runcoldstartscript.portals', 'false');

/** Helper Methods **/
function getPortalSysIds(portals) {
    var portalSysIds = [];
    var gr = new GlideRecord("sp_portal");
    gr.addQuery('title', 'IN', portals);
    gr.query();

    while (gr.next() && gr.getValue('sys_id') != null) {
        portalSysIds.push(gr.getValue('sys_id'));
    }
    return portalSysIds;
}

function getSearchSourceIds(portalSysId) {
    var searchSourceIds = [];
    var portalGr = new GlideRecord('m2m_sp_portal_search_source');
    portalGr.addQuery('sp_portal', portalSysId);
    portalGr.query();

    while (portalGr.next()) {
        searchSourceIds.push(portalGr.getValue('sp_search_source') + "");
    }

    return searchSourceIds;
}

function getSearchSources(searchSourceIds) {
    var searchSources = [];

    var searchGr = new GlideRecord('sp_search_source');
    searchGr.addQuery('sys_id', "IN", searchSourceIds);
    searchGr.query();

    while (searchGr.next()) {
        if (searchGr.getValue("source_table") == null) {
            if (searchGr.getValue("id") == "kb")
                searchSources.push("kb_knowledge");
            else if (searchGr.getValue("id") == "qa")
                searchSources.push("kb_social_qa_question");
            else if (searchGr.getValue("id") == "sc")
                searchSources.push("sc_cat_item");
        } else
            searchSources.push(searchGr.getValue("source_table") + "");
    }
    return searchSources;
}

gs.info("Data Import ended");
