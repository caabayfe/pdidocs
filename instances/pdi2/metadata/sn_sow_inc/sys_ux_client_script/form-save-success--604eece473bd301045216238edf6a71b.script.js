/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    let { elementId, payload: { data } } = event;
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();
    let formSection = elementId.substring(elementId.lastIndexOf('_') + 1);
    if (event.name == "SOW_MODAL#ACTION_STATUS") {
        if (event.payload.status == "success") formSection = "summary";
        else return;
    }

    if (data && data.output.result.status == 'success' || event.payload.status == "success") {
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        let fieldsCopy = api.context.props.fields;
        var sections = sowIncidentOverview.getOverviewCards()[formSection];
        for (var i = 0; i < sections.length; i++) {
            handleSave(sections[i], sectionConfigObject);
        }
        api.setState('sectionConfig', sectionConfigObject);
        api.setState("dirtyFields", {});
        sowIncidentOverview.setFocusForSaveBtn(sections[0], helpers, fieldsCopy);
    } else {
        let message = await helpers.translate('Invalid update');
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                type: 'error',
                message: message
            }]
        });
    }

    function handleSave(formSection, sectionConfigObject) {
        sectionConfigObject[formSection] = {
            ...api.state.sectionConfig[formSection],
            isEdit: false,
            showErrorMessage: false
        };
        let fields = api.state.sectionConfig[formSection].fields;
        for (let i = 0; i < fields.length; i++) {
            if (api.state.fieldsCopy[fields[i]]) {
                sectionConfigObject[formSection][fields[i]] = api.state.fieldsCopy[fields[i]].displayValue;
            }
        }
    }

}
