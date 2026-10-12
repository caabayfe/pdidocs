/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {
    const impactDetailsOutput = api.data.impact_details_1.output;
    api.setState('impactDetails', impactDetailsOutput);

    let sowIncidentImpactGeomapUtils = imports["sn_sow_inc.SowIncidentImpactGeomapUtils"]();
    let geoMapConfig = await sowIncidentImpactGeomapUtils.getGeomapConfig(helpers, impactDetailsOutput);
    api.setState('geoMapConfig', geoMapConfig);

    let impactedLocationsAndUsers = [];
    const impactedLocationsCount = impactDetailsOutput.impactedLocationsCount;
    const impactedUsersCount = impactDetailsOutput.impactedUsersCount;

    impactedLocationsAndUsers.push({
        label: await helpers.translate('Locations'),
        value: {
            type: 'string',
            value: impactedLocationsCount
        }
    });
    impactedLocationsAndUsers.push({
        label: await helpers.translate('Users'),
        value: {
            type: 'string',
            value: impactedUsersCount
        }
    });

    api.setState('impactedLocationsAndUsers', impactedLocationsAndUsers);
    api.setState('impactedLocationsAndUsersDataLoaded', true);
}
