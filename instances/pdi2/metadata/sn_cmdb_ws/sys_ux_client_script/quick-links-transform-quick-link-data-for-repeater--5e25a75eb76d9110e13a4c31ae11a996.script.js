/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
     const {
        MAX_NUM_QUICK_LINKS
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        hasCmdbAdminOrAdminOrMaint,
        hasManualCiIRERole
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    if(api.data.get_cmdb_quick_links && api.data.get_cmdb_quick_links.output) {
        let quickLinks = api.data.get_cmdb_quick_links.output.data.GlideRecord_Query.sn_cmdb_ws_quick_links._results;
        let transformedQuickLinks = [];
        const featureFlagsToCheckCompat = [];
        let recordsWithoutUser = 0;
        api.setState('quickLinkMaxLength', MAX_NUM_QUICK_LINKS);
        let defaultTranslations = {
            "07beb5c1ff711110e13abb63aad33e12": await helpers.translate("Dependency Views"),
            "51ab0cd885925110f8775117a6a927da": await helpers.translate("CI Class List"),
            "89730209ff711110e13abb63aad33e30": await helpers.translate("Data Manager"),
            "9df18a85ff711110e13abb63aad33e4b": await helpers.translate("Query Builder"),
            "a92650560710211017b703767cd30016": await helpers.translate("Unified Map"),
            "f006939fa3e002105c01b6ae041e6196": await helpers.translate("CMDB Health Dashboard"),
            "d3081f13a32402105c01b6ae041e61b1": await helpers.translate("Relationship Health Dashboard"),
            "1f3d10987f011210cc4835c59c86652a":  await helpers.translate("Create CI"),
            "1539743bfff02a1002e6ffffffffff26": await helpers.translate("Data Certification Dashboard")
        };

        for (let index = 0; index < quickLinks.length; index++) {
            if (quickLinks[index].feature_id.value) {
                // remove link if incompatible and the api is done fetching data
                if (api.data.featureSupportApi.output.complete && !api.data.featureSupportApi.output[quickLinks[index].feature_id.value].supported) {
                    continue;
                } else if (!api.data.featureSupportApi.output.complete) {
                    // else add the flags to queue to fetch compatibility
                    featureFlagsToCheckCompat.push(quickLinks[index].feature_id.value);
                }
            }
            if (quickLinks[index].sys_id.value === "89730209ff711110e13abb63aad33e30") {
                if (!hasCmdbAdminOrAdminOrMaint(api.context.session.user.roles)) {
                    continue;
                }
            } else if (quickLinks[index].sys_id.value === "1f3d10987f011210cc4835c59c86652a") {
                if (!(hasCmdbAdminOrAdminOrMaint(api.context.session.user.roles) || hasManualCiIRERole(api.context.session.user.roles))) {
                    continue;
                }
            }
            let linkTitle = decodeURIComponent(quickLinks[index].title.value);
            if (defaultTranslations[quickLinks[index].sys_id.value])
                linkTitle = defaultTranslations[quickLinks[index].sys_id.value];

            let link = {
                'url': quickLinks[index].route.value ? "javascript:void(0);" : decodeURIComponent(quickLinks[index].url.value),
                'title': linkTitle,
                'order': quickLinks[index].order.value,
                'sys_id': quickLinks[index].sys_id.value,
                'user': quickLinks[index].user.value,
                'open_new_window': quickLinks[index].open_new_window.value,
                'route': quickLinks[index].route.value ? quickLinks[index].route.value : "",
                'route_params': quickLinks[index].route_params.value ? JSON.parse(quickLinks[index].route_params.value) : "",
                'route_target': quickLinks[index].route_target.value ? quickLinks[index].route_target.value : ""
            };
            if(!quickLinks[index].user.value){
               recordsWithoutUser++;     
            }
            link['editContainerHidden'] = true;
            link['invalidURLMessage'] = '[]';
            transformedQuickLinks.push(link);
        }
        if (featureFlagsToCheckCompat.length > 0) {
            // trigger check for compatibility api and re-run the link generator on fetch
            api.setState("featureFlagsToCheckCompat", featureFlagsToCheckCompat.join());
            return;
        }
        api.setState("quickLinksDisableEditActions", recordsWithoutUser == transformedQuickLinks.length ? true: false);
        api.setState('quickLinksTruncated', transformedQuickLinks);
        api.setState('quickLinksFetchedRecordCount', transformedQuickLinks.length);
        let tempQuickLinks = JSON.parse(JSON.stringify(transformedQuickLinks));
        if (api.state.quickLinksMoreItemAvailable == 'no') {
            api.setState('quickLinks', tempQuickLinks);
            api.setState('quickLinksMoreItemAvailable', 'no');
            let text = await helpers.translate('View fewer');
            api.setState('quickLinksViewMoreFewerText', text);
        } else {
            api.setState('quickLinks', tempQuickLinks.splice(0, api.state.quickLinkMaxLength));
            if (transformedQuickLinks.length > api.state.quickLinkMaxLength) {
                api.setState('quickLinksMoreItemAvailable', 'yes');
                let text = await helpers.translate('View {0} more', (transformedQuickLinks.length - api.state.quickLinkMaxLength));
                api.setState('quickLinksViewMoreFewerText', text);
            }
        }
    }
}
