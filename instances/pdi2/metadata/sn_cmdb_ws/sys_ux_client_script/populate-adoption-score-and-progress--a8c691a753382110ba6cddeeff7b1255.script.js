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
    const selectedIndex = api.context.props.selectedTabIndex;
    const {
        label: currentTabLabel,
        productCategory
    } = api.state.tabsMetadata[selectedIndex];
    const {
        usagePct: currentTabScore,
        rating: {
            badge: badgeInfo
        },
        features: featuresInfo,
        highRating: highRating
    } = api.data.get_product_adoption_state.output[productCategory];

    const {
        DATA_INGESTION_TAB_ID
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    let infoTooltip = await helpers.translate('Based on the number of features in use in this category, as a percentage of total. A rating of > {0}% denotes high adoption.', [highRating]);

    if (productCategory === DATA_INGESTION_TAB_ID)
        infoTooltip = await helpers.translate('Based on the % CIs processed by IRE out of total CI records. A rating of > {0}% denotes high adoption.', [highRating]);
        
    api.setState('adoptionScoreData', {
        title: await helpers.translate('{0} adoption', [currentTabLabel]),
        infoTooltip: infoTooltip,
        score: currentTabScore + "%",
        badge: badgeInfo
    });

    let adoptionProgressData = [];
    for (let feature in featuresInfo) {
        const {
            title,
            marketingCopy: {
                link: {
                    type,
                    href,
                    openNewWindow,
                    route
                }
            },
            state: {
                label,
                variant,
                color,
                positive,
                hide
            }
        } = featuresInfo[feature];

        if (!hide) {
            const adoptionScoreProgressObj = {
                link: {
                    label: title,
                    type: type,
                    href: href,
                    openNewWindow: openNewWindow,
                    route: route
                },
                badge: {
                    label: label,
                    variant: variant,
                    color: color,
                    positive: positive
                }
            };
            adoptionProgressData.push(adoptionScoreProgressObj);
        }
    }

    //Display the features that are not installed / not enabled / not in use in the top and sort the rest alphabetically
    adoptionProgressData = adoptionProgressData.sort(function (a,b) {
        if(a.badge.positive === b.badge.positive) {
            return a.link.label < b.link.label ? -1 : 1;
        } else {
            return a.badge.positive < b.badge.positive ? -1 : 1;
        }
    });

    api.setState('adoptionProgressData', adoptionProgressData);
}
