/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */

function evaluateProperty({
    api,
    helpers
}) {
    let paraFirst = `<p>${helpers.translateSync('You have already completed this guided setup. Continuing ahead will allow you to edit the guided setup.')}</p>`;
    let paraSecond = `<p>${helpers.translateSync('<strong>Note</strong>: It will move the Guided Setup to <strong>Draft</strong> state. Do you wish to continue?')}</p>`;
    return `<div style="font-size:16px;line-height:20px">
            ${paraFirst}
            ${paraSecond}
          </div>`;
}
