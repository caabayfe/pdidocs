/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const propVal = api.data.look_up_preview_page_property.output && api.data.look_up_preview_page_property.output["sn_sow_inc.pir_pdf_preview_sow_page"] && api.data.look_up_preview_page_property.output["sn_sow_inc.pir_pdf_preview_sow_page"].value;
    if (propVal)
        return `/${propVal}?sysparm_sys_id=${api.context.props.sysId}&refresh_time=${api.state.lastUpdated}`;
    return '';
}
