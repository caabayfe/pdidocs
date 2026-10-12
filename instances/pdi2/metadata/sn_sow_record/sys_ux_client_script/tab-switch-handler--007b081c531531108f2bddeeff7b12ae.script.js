/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const eventName = event.name;
    const _getRecordPageTabsMap = () => (api.data.associated_record_page_tabs.output || {});
    const _getInlineTabs = () => ({
        "details": {
            "condition": true
        },
        "related-lists": {
            "condition": !(api.context.app.relatedListLayout !== "horizontal")
        },
        "related-records": {
            "condition": !(!(!(api.context.app.relatedListLayout) || (api.context.app.relatedListLayout === "vertical")) || (api.context.props.sysId === "-1"))
        },
        "record-history": {
            "condition": false
        },
    });

    const _getHorizontalTabIndex = (routeType, isRL) => {
        const availableTabs = (api.viewports.record_page_tabs.routeDefinitions) || {};
        const recordPageTabsMap = _getRecordPageTabsMap();
        const recordPageInlineTabs = _getInlineTabs();
        const outputMap = {};
        let tabsInOrder = [];
        for (const [position, tabList] of Object.entries(recordPageTabsMap)) {
            outputMap[position] = {};
            for (const routeType of tabList)
                if (availableTabs.hasOwnProperty(routeType))
                    outputMap[position][routeType] = availableTabs[routeType];
        }
        tabsInOrder = tabsInOrder.concat(Object.keys(outputMap["left"]));

        if (recordPageInlineTabs["details"].condition)
            tabsInOrder.push("details");

        tabsInOrder = tabsInOrder.concat(Object.keys(outputMap["middle"]));

        if (recordPageInlineTabs["related-lists"].condition) {
            if (isRL) {
                const rlIndex = api.data.record.relatedLists.findIndex((rlItem) => rlItem.value === routeType)
                return {
                    recordTabIndex: (tabsInOrder.length + rlIndex)
                };
            } else
                api.data.record.relatedLists.forEach((rl) => tabsInOrder.push(rl.id));
        }

        if (recordPageInlineTabs["related-records"].condition) {
            let rlTabs = api.state.RelatedRecordTabs;
            if (isRL) {
                let rlIndex = -1,
                    index = 0;
                for (index = 0; index < rlTabs.length; index++) {
                    tabsInOrder.push(rlTabs[index].id);
                    rlIndex = rlTabs[index].relatedListsData.findIndex((relatedObj) => relatedObj.value === routeType);
                    if (rlIndex != -1)
                        break;
                }
                return {
                    recordTabIndex: tabsInOrder.length - 1,
                    recordSubTabIndex: rlIndex,
                    relatedListIndex: index
                };
            } else
                rlTabs.forEach((rlTab) => tabsInOrder.push(rlTab.id));
        }

        if (recordPageInlineTabs["record-history"].condition)
            tabsInOrder.push("record-history");

        tabsInOrder = tabsInOrder.concat(Object.keys(outputMap["right"]));
        return {
            recordTabIndex: tabsInOrder.indexOf(routeType)
        };
    };

    const _getSidepanelTabIndex = (routeType) => {
        const sidePanelTabs = api.viewports.viewport_gph.routeDefinitions || {};
        const sortedData = Object.fromEntries(Object.entries(sidePanelTabs).sort((a, b) => a[1].order - b[1].order));
        return Object.keys(sortedData).indexOf(routeType);
    };

    const _emitContentUpdatedEvent = (selectedTabIndex, relatedListIndex) => {
        if (api.context.props.selectedTabIndex == selectedTabIndex)
            return;
        let selectedTab = "";
        if(relatedListIndex != null) 
            selectedTab = "id=cllkczjpj019y3b7s7xtteqt5^index="+relatedListIndex;
        api.emit('CONTENT_UPDATED', {
            params: {
                selectedTabIndex: selectedTabIndex,
                selectedTab: selectedTab,
                query: api.context.props.inputQuery,
                views: api.context.props.forcedViewName,
                extraParams: api.context.props.extraParams
            }
        });
    }

    const switchTab = () => {
        const routeType = event.payload.route;
        const type = event.payload.type;

        if (!routeType || !type)
            return;
        else {
            if (type === 'record-tab') {
                const {
                    recordTabIndex
                } = _getHorizontalTabIndex(routeType);
                if (recordTabIndex !== -1)
                    _emitContentUpdatedEvent(recordTabIndex);
            } else if (type === 'contextual-sidebar') {
                const sidebarIndex = _getSidepanelTabIndex(routeType);
                if (sidebarIndex !== -1)
                    api.setState("sidebarSelectedTabIndex", sidebarIndex);
            } else if (type == "related-list") {
                const {
                    recordTabIndex,
                    recordSubTabIndex,
                    relatedListIndex
                } = _getHorizontalTabIndex(routeType, true);

                _emitContentUpdatedEvent(recordTabIndex, relatedListIndex);
                if (recordSubTabIndex) {
                    let rlTabs = api.state.RelatedRecordTabs;
                    // Make the subTabIndex to String/Integer alternatively to induce state change.
                    rlTabs[relatedListIndex].subTabIndex = (typeof rlTabs[relatedListIndex].subTabIndex == 'string') ? recordSubTabIndex : String(recordSubTabIndex);

                    // Make a deep clone update to 'RelatedRecordTabs' to trigger the state change
                    api.setState("RelatedRecordTabs", JSON.parse(JSON.stringify(rlTabs)));
                }
            }
        }
    };

    switch (eventName) {
        case 'UXF_TAB_SET#TAB_SELECTED':
            if (event.elementId == "viewport_gph" && !event.payload.isInitialPageLoad)
                api.setState("sidebarSelectedTabIndex", event.payload.selectedTabIndex);
            break;
        case 'SOW_RECORD#ROUTE_REQUESTED':
            switchTab();
            break;
    }
}
