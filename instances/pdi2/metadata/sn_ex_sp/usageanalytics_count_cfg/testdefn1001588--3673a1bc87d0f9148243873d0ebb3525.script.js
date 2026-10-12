answer = getAisaRpConfigs();

function getAisaRpConfigs() {
    var gr = new GlideRecord('sp_portal');
    gr.get('70cd9f3b734b13001fdae9c54cf6a72f');
    if (!gr.isValidRecord()) {
        return 0;
    }
    if (gr.getValue('enable_ais') == '0') {
        return 0;
    }
    var searchApp = gr.search_application;
    if (gs.nil(searchApp)) {
        return 0;
    }
    var searchProfile = searchApp.search_profile;
    if (gs.nil(searchProfile) || searchProfile.active == '0' || searchProfile.state != 'PUBLISHED') {
        return 0;
    }
    var ga = new GlideAggregate('aisa_rp_config');
    ga.addQuery('active', true);
    ga.addQuery('search_app', searchApp);
    ga.addAggregate('COUNT');
    ga.query();
    if (ga.next()) {
        return ga.getAggregate('COUNT');
    }
    return 0;
}
