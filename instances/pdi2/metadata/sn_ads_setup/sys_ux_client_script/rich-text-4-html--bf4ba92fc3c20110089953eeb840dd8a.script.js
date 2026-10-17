/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return `<div style="font-size:16px;font-weight:400;line-height:20px">
      ${helpers.translateSync("Please activate the setup before finalizing to avoid losing the changes you made.")}
   <br/><br/>
</div>`;
}
