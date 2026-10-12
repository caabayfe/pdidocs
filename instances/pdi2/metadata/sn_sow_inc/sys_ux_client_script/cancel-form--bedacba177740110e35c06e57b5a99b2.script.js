/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    let { elementId } = event;
    let formSection = elementId.substring(0, elementId.indexOf('_'));
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();

    var sections = sowIncidentOverview.getOverviewCards()[formSection];
    let sectionConfigObject = {
        ...api.state.sectionConfig
    };
    for (var i = 0; i < sections.length; i++) {
        handleCancel(sections[i], sectionConfigObject);
    }
    api.setState('sectionConfig', sectionConfigObject);

    function handleCancel(formSection, sectionConfigObject) {
        sectionConfigObject[formSection] = {
            ...api.state.sectionConfig[formSection],
            isEdit: false
        };
    }
}
