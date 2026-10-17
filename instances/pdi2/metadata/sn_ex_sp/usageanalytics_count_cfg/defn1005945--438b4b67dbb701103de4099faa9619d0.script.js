function getTaxonomyId() {
    var portalId = getECPortalId();
    if (!portalId)
        return;

    var gr = new GlideRecord("m2m_sp_portal_taxonomy");
    if (!gr.isValid())
        return;

    gr.addActiveQuery();
    gr.addQuery("sp_portal", portalId);
    gr.addQuery("taxonomy.active", true);
    gr.query();
    while (gr.next())
        return gr.taxonomy.toString();
}


function getECPortalId() {
    var gr = new GlideRecord("sp_portal");
    gr.addActiveQuery();
    gr.addQuery("sys_id", "70cd9f3b734b13001fdae9c54cf6a72f");
    gr.addOrCondition("url_suffix", "esc");
    gr.query();
    while (gr.next())
        return gr.sys_id.toString();
}

answer = 0;

var gr = new GlideRecord("m2m_connected_content");
var taxonomyId = getTaxonomyId();
if (gr.isValid() && taxonomyId) {
    gr.addQuery("content_type", "4c32a92153622010069addeeff7b12a3");
    gr.query();
    answer = gr.getRowCount();
}
