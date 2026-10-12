function redirect_preview() {
    g_form.getReference('template', callback);
}

function callback(caller) {
    var template = caller.id;
    if (!template || template === '') {
        g_form.addErrorMessage(getMessage('Please select a template to preview'));
    } else {
        var topic = g_form.getUniqueValue();
        var taxonomyId = g_form.getValue('taxonomy');
        var ga = new GlideAjax('sn_ex_sp.PortalTaxonomyUtil');
        ga.addParam('sysparm_name', 'getPortals');
        ga.addParam('sysparm_taxonomyId', taxonomyId);
        ga.getXML(function (response) {
            if (response) {
                var result = response.responseXML.documentElement.getAttribute('answer');
                var url = '';
                if (result.length > 0) {
                    var portals = JSON.parse(result);
                    if (portals.length == 1) {
                        url = '/' + portals[0].url + '?id=' + template + '&topic_id=' + topic;
                        g_navigation.open(url, '_blank');
                    } else if (portals.length > 1) {
                        var dialog = new GlideModal('sn_ex_sp_service_portal_selection');
                        dialog.setTitle(getMessage('Preview template'));
                        dialog.setPreference('sysparm_template', template);
                        dialog.setPreference('sysparm_topic', topic);
                        dialog.setPreference('sysparm_taxonomyId', taxonomyId);
                        dialog.setPreference('sysparm_portals', portals);
                        dialog.setWidth(400);
                        dialog.render();
                    } else {
                        url = '/esc?id=' + template + '&topic_id=' + topic;
                        g_navigation.open(url, '_blank');
                    }
                }
            }
        });
    }
}
