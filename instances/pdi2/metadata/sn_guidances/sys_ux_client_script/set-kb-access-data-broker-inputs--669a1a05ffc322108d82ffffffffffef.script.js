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
    const {
        customExpProps: {
            table,
            actionInputs: {
                task,
                knowledge
            } = {}
        } = {}
    } = api.context.props;

    const kbAccessInputs = {
        currentRecordTable: table,
        currentRecordSysId: task,
        kbSysId: knowledge
    };
    api.setState('kbAccessInputs', kbAccessInputs);
}
