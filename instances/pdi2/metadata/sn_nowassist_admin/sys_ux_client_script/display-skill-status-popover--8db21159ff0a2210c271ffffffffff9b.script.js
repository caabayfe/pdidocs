/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var rowIndex = api.state.skillRowPayload.rows.findIndex(obj => obj.key === event.payload?.cellContext?.row?.key);
    // var rowIndex = event.payload?.cellContext?.rowIndex;
    var statusCode = event.payload?.cellContext?.cell?.componentProps?.label;
    var popover = {
        target: {
            rowIndex: rowIndex + 1,
            cellIndex: 7
        },
        config: {
            positions: [{
                target: 'top-center',
                content: 'bottom-center'
            }]
        },
        content: {
            popoverType: "custom",
            componentTag: "now-stylized-text",
            defaultComponentProps: {
                text: statusCode,
                tag: "div"
            }
        }
    }
    api.setState('skillStatusPopover', popover);

}
