function script({ api, event, helpers, imports }) {
    //processRelatedItemInformation script in Map Search Filter Controller; fired after map's dataset changes
    const data = event.payload?.relatedItemsData?.data?.output?.data ?? null;
    if (!data) return;
    const { getHash, cloneDeep } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const { MULTIPLE_BADGE_ICON } = imports["sn_cmdb_ws.unifiedMapUtilsMapSearchFilter"]();
    const priorityOrder = ["critical", "high", "orange", "moderate", "low", "green", "info", "green-yellow", "primary", "positive", "gray"];
    const result = [];

    let relatedItemCache = api.state.relatedItemCache;
    const ids = Object.keys(data);
    let hashSysIds = getHash(ids);
    if (relatedItemCache[hashSysIds]) {
        return;
    }

    var addBadges = {
        
        initialize: function () {
            let badgeNodeObject = this.createNodeBadgeObject();
            if (badgeNodeObject?.length > 0) {
                this.updateNodeWithBadgeData(badgeNodeObject, api);
            }
        },

        createNodeBadgeObject: function () {
            for (const objKey in data) {
                const obj = data[objKey];
                const timeline = Object.values(obj)
                .flatMap(timelineObj => 
                    Array.isArray(timelineObj) 
                        ? timelineObj.filter(current => current.timeline?.timelineHighlight).map(current => current.timeline) 
                        : []
                );
                if (timeline?.length) {
                    const sortedTimeline = timeline.sort((a, b) => {
                        const priorityA = priorityOrder.indexOf(a.timelineHighlight.highlightedStyle.colorName.toLowerCase());
                        const priorityB = priorityOrder.indexOf(b.timelineHighlight.highlightedStyle.colorName.toLowerCase());
                        return priorityA - priorityB;
                    });

                    const highestPriority = sortedTimeline[0].timelineHighlight.highlightedStyle.colorName;
                    const filteredTimeline = sortedTimeline.filter(item => item.timelineHighlight.highlightedStyle.colorName === highestPriority);
                    //If there is more than activity then we show as multiple
                    if (timeline.length > 1) {
                        result.push({
                            sysId: objKey,
                            colorName: filteredTimeline[0].timelineHighlight.highlightedStyle.colorName,
                            icon: MULTIPLE_BADGE_ICON,
                            value: api.state.translations.MULTIPLE
                        });
                    } else {
                        result.push({
                            sysId: objKey,
                            colorName: filteredTimeline[0].timelineHighlight.highlightedStyle.colorName,
                            icon: filteredTimeline[0].icon || '',
                            value: filteredTimeline[0].timelineHighlight.value || '',
                        });
                    }
                }
            }
            return result;
        },

        updateNodeWithBadgeData: function (result, api) {
            var nodes = cloneDeep(api.state.nodes);
            for (const objItem of result) {
                const { sysId, colorName, icon, value } = objItem;
                const node = nodes.find(node => node.id === sysId);
                if (node) {
                    node.viewData.status = colorName;
                    node.viewData.statusMessage = value;
                    node.viewData.indicatorIcon = icon;
                }
            }
            relatedItemCache[hashSysIds] = nodes;
            api.setState("relatedItemCache", relatedItemCache);
            api.setState("nodes", nodes); //TODO this needs to be changed to go thru ciData and not directly changing the nodes output since it can get overwritten   
        }
    }
    addBadges.initialize();
}
