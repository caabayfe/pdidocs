/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const styles = `
        font-family: var(--Typography--now-font-family);
        font-size: 16px;
        font-weight: 600;
        line-height: 19.2px;
        
    `;

    return `
        <div style="${styles}">
            ${helpers.translateSync("No pending configurations exist. Start a new one from")} 
            <a href="/now/adoptionservices/home/params/selectedTabIndex/1">
                ${helpers.translateSync("All Applications")}
            </a>.
        </div>
    `;
}
