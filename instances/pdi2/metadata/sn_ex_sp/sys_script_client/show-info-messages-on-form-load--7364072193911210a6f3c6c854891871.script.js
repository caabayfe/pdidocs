function onLoad() {
        var sysId = g_form.getUniqueValue();
        var ga = new GlideAjax('PortalExtensibleNavigationAjax');
        ga.addParam('sysparm_name', 'getParentSyncStatus');
        ga.addParam('childNavItemSysId', sysId);
        ga.getXML(ajaxCallback);

        function ajaxCallback(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer && answer === 'in_progress') {
                g_form.addFormMessage(
                    getMessage('Sync is in progress. Once the sync completes you will be notified via email.'),
                    'warning'
                );
            }
        }
    }
