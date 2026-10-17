/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId != "build_incident_overview_sections_read_view" && event.payload.name != "fields")
        return;

    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();
    let formSections = sowIncidentOverview.getOverviewFormSections();

    let fieldsCopy = {
        ...api.context.props.fields
    };
    api.setState("fieldsCopy", fieldsCopy);
    for (let k = 0; k < formSections.length; k++) {
        sowIncidentOverview.processFields(fieldsCopy, formSections[k]);
    }

    const formData = api.data["retrieve_form_section_layout"].output.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query;
    const sectionLayout = formData.formLayout.sectionLayout;
    let sectionConfigObject = {
        ...api.state.sectionConfig
    };
    sowIncidentOverview.buildSection(api, sectionLayout, formSections, fieldsCopy, sectionConfigObject);
    sowIncidentOverview.translateToggleTooltipText(helpers, sectionConfigObject);
    api.setState("sectionConfig", sectionConfigObject);

    if (api.state.initialSectionLoad.summary ||
        api.state.initialSectionLoad.impact ||
        api.state.initialSectionLoad.business_impact ||
        api.state.initialSectionLoad.cause ||
        api.state.initialSectionLoad.resolution) {
        var initialSectionLoadObj = {
            ...api.state.initialSectionLoad
        };
        var eagerSecionsConfig = api.data["build_incident_overview_sections_read_view"].output;
        for (let k = 0; k < formSections.length; k++) {
            if (!api.state.initialSectionLoad[formSections[k]]) {
                continue;
            }
            if (sowIncidentOverview.isInitialLoadOutdated(eagerSecionsConfig[formSections[k]], sectionConfigObject[formSections[k]])) {
                initialSectionLoadObj[formSections[k]] = false;
            }
        }
        api.setState("initialSectionLoad", initialSectionLoadObj);
    }
}
