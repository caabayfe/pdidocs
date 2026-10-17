/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const internalType = api.state.selectedActivityFieldDetails.internalType;
    const {
        STRING,
        JOURNAL_INPUT
    } = api.state.INTERNAL_TYPES;

    return !Boolean((internalType === STRING || internalType === JOURNAL_INPUT) &&
        api.state.selectedEntity?.source_type?.value != api.state.SOURCE_TYPES.EXTERNAL_DATA
    );
}
