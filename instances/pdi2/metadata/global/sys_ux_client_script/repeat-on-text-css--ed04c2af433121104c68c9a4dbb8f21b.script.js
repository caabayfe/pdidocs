/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const color = api.state.isRepeatOnValid ? 'rgb(var(--now-form-field_label--color))' : 'rgb(var(--now-form-field_label--color--invalid))';
    return `{ display: inline-block; font-size: 12px; color: ${color}; }`;
}
