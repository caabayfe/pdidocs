/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const searchTerm = (api.data.controller.searchTerm || '').toLowerCase();
    const recents = api.data.controller.recentlyViewed.filter((result) => !searchTerm || result.label.toLowerCase().includes(searchTerm));

    return {
        customCellEmittedActions: ['NOW_BUTTON_ICONIC#CLICKED'],
        rows: recents.map((item) => ({
            key: item.id,
            type: "default",
            fieldName: item.fieldName,
            route: item.route,
            cells: {
                favorites: {
                    type: "custom",
                    componentTag: "now-button-iconic",
                    componentProps: {
                        icon: item.isFavorite ? "star-fill" : "star-outline",
                        variant: "primary",
                        bare: true,
                        configAria: {
                            "aria-label": item.isFavorite ? helpers.translateSync("Remove from favorites") : helpers.translateSync("Add to favorites")
                        },
                        tooltipContent: item.isFavorite ? helpers.translateSync("Remove from favorites") : helpers.translateSync("Add to favorites")
                    },
                    metadata: {
                        "item": item,
                    }
                },
                label: {
                    type: "string",
                    value: item.label,
                    label: item.label
                },
                className: {
                    type: "string",
                    value: item.sublabel,
                    label: item.sublabel
                },
                scope: {
                    type: "string",
                    value: item.scope,
                    label: item.scope
                },
                updated: {
                    type: "number",
                    value: new Date(item.updated).getTime() / 1000,
                    metadata: {
                        "internalValue": item.updated,
                        "internalType": "glide_date_time"
                    }
                }
            }
        }))
    };
}
