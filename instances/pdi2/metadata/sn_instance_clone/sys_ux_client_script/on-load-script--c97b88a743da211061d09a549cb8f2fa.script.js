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
    // Read the URL page parameter
    const activity = api.context.props.activity || '';
    const return_fields = (activity === 'overview') ? api.state.overviewPage_return_fields : api.state.activityPage_return_fields;
    const return_fields_default = (activity === 'overview') ? api.state.overviewPage_return_fields_default : api.state.activityPage_return_fields_default;
    api.setState("return_fields", return_fields);
    api.setState("return_fields_default", return_fields_default);
    var translations = api.state.translations;
    helpers.translate('Source Instance')
        .then((val) => {
            translations.source_instance = val;
            api.setState('translations', translations);
        });
    helpers.translate('Target Instance')
        .then((val) => {
            translations.target_instance = val;
            api.setState('translations', translations);
        });
    helpers.translate('Estimated End Time')
        .then((val) => {
            translations.estimated_end_time = val;
            api.setState('translations', translations);
        });
    helpers.translate('Duration')
        .then((val) => {
            translations.duration = val;
            api.setState('translations', translations);
        });
    helpers.translate('Profile Name')
        .then((val) => {
            translations.profile = val;
            api.setState('translations', translations);
        });
    helpers.translate('Instance Overview')
        .then((val) => {
            translations.instance_overview = val;
            api.setState('translations', translations);
        });
    helpers.translate('Clone Activity')
        .then((val) => {
            translations.clone_activity = val;
            api.setState('translations', translations);
        });
        helpers.translate('Your instances and their last clone date')
        .then((val) => {
            translations.overview_text = val;
            api.setState('translations', translations);
        });
    helpers.translate('Clone requests sorted by most recent')
        .then((val) => {
            translations.activity_text = val;
            api.setState('translations', translations);
        });
        helpers.translate('State (WIP, Complete, Error etc)')
        .then((val) => {
            translations.state = val;
            api.setState('translations', translations);
        });
        helpers.translate('CHG')
        .then((val) => {
            translations.change_number = val;
            api.setState('translations', translations);
        });
        helpers.translate('Scheduled Date/Time')
        .then((val) => {
            translations.scheduled = val;
            api.setState('translations', translations);
        });
        helpers.translate('Clone Result')
        .then((val) => {
            translations.clone_result = val;
            api.setState('translations', translations);
        });
        helpers.translate('Last Clone')
        .then((val) => {
            translations.last_clone = val;
            api.setState('translations', translations);
        });
        helpers.translate('From Source')
        .then((val) => {
            translations.from_source = val;
            api.setState('translations', translations);
        });
        helpers.translate('Completed')
        .then((val) => {
            translations.completed = val;
            api.setState('translations', translations);
        });
}
