function transform(input) {

    var answer = {};

    function isCatalogGenerationActive() {
        var gr = new GlideRecord("sn_nowassist_skill_config_status");
        if (!gr.isValid()) {
            return false;
        }
        gr.addEncodedQuery("skill_config=42bdcc7021d98210f877f506640a1d2d");
        gr.query();
        if (gr.next()) {
            return gr.getValue("active") == 1 ? true : false;
        }
        return false;
    }

    function getRouteInformation() {
        var answer = [];
        var gr = new GlideRecord("sys_ux_app_route");
        if (!gr.isValid()) {
            return answer;
        }
        // Query the Service Catalog Builder routes that do not belong to a ViewPort
        gr.addEncodedQuery("app_config=4a1c734573021010e12d1e3014f6a7b8^parent_macroponent_composition_element_id=NULL");
        gr.query();
        while (gr.next()) {
            answer.push({
                route: gr.getValue("route_type"),
            });
        }
        return answer;
    }

    function canEditWithNowassist(catItemId) {
        if (!GlideStringUtil.isEligibleSysID(catItemId))
            return false;

        var catalogItemGr = new GlideRecord("sc_cat_item");
        catalogItemGr.addQuery("sys_id", catItemId);
        catalogItemGr.query();
        if (catalogItemGr.next())
			return catalogItemGr.published_ref.nil() && catalogItemGr.state == 'draft';

        return true;
    }

    return {
        isSkillActive: isCatalogGenerationActive(),
        routes: getRouteInformation(),
        canEditWithNowassist: canEditWithNowassist(input.catItemId)
    };
}
