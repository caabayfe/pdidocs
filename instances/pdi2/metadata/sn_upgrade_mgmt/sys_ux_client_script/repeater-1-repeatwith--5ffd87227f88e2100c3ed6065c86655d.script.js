/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const nodes = api?.data?.upgrade_management___get_upgrade_details_1?.output?.upgradeMonitorStatusProviderDetails?.nodes;

    if (!nodes || nodes.length === 0) return nodes || [];

    nodes.map((item) => {
        switch (item.state) {
            case "0":
                item.css = {
                    color: "yellow"
                };
                break;
            case "1":
                item.css = {
                    color: "blue"
                };
                break;
            case "2":
                item.css = {
                    color: "green"
                };
                break;
            case "3":
                item.css = {
                    color: "red"
                };
                break;
            case "4":
                item.css = {
                    color: "black"
                };
                break;
            default:
                item.css = {
                    color: "yellow"
                };
        }
        return item;
    });
    return nodes;
}
