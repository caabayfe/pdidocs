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
    const { interactionId } = api.context.props;
    let guidance = api.data.get_guidance_2.results;
    if(guidance.length > 1 && interactionId) {
        guidance = guidance.filter(gud => gud.hui_sys_id.value == interactionId)[0];
    } else {
        guidance = guidance[0];
    }
    const processDefinition = guidance?.hg_process_definition?._reference;
    const isSingleExecutionType = (guidance?.hg_setup_execution_type.value || 'single') == 'single';
    const hgName = guidance?.hg_name?.displayValue;
    const hgDescription = guidance?.hg_description?.displayValue
    //TODO: move the title and description to generic function in script includes
    //TODO: improvise the logic for handling empty string when setup value is not present
    const title = (isSingleExecutionType && hgName) || guidance?.hui_setup_name?.displayValue || processDefinition?.label?.displayValue|| '';
    const description = (isSingleExecutionType && hgDescription) || guidance?.hui_description?.displayValue || processDefinition?.description?.displayValue || '';
    const checklist = guidance?.hg_checklist?.displayValue || '';

    api.setState('guidance', { title, description, checklist });
}
