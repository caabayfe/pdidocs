/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        initDataFetchState,
        isEmptyObj
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const {
        handleFormDataPropsChange,
        handleSelectedNavPropsChange
    } = imports["sn_cmdb_ws.ExploreCIMainContentUtils"](...arguments);

    initDataFetchState();

    const { formData, selectedNav } = api.context.props;

    if (!isEmptyObj(formData)) {
        handleFormDataPropsChange(formData);
    }
    if (!isEmptyObj(selectedNav)) {
        handleSelectedNavPropsChange(selectedNav);
    }
}
