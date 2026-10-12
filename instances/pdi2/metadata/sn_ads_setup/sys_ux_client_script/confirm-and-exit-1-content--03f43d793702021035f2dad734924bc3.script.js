/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return `
    <div style="font-size:16px;line-height:20px">
      ${helpers.translateSync('You can come back anytime to resume the remaining task to configure the {setupname} setup.', {setupname: api.state.setupName})}
    </div>
    <br></br>
    <div style="font-size:16px;line-height:20px">
        ${helpers.translateSync('Those you already configured will remain the same without losing any data.')}
    </div>
    `;

}
