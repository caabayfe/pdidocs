function script({ api, event, helpers, imports }) {
    const { getHash } = imports["sn_cmdb_ws.unifiedMapUtils"]();
    //Related Items Data Controller relatedItemsPropertyChanged script; event fired when the list of CI sys_id has changed to render related items data
    const handler = {
        cache: api.state.cache,
        relatedItemCategorySysId: api.context.props.relatedItemCategorySysId,
        ciSysIds: api.context.props.relatedItemSysids,
      
        initialize: function() {
            this.allNodesSysIds = api.context.props.allNodes?.nodes?.map(x => x.id) || 
                api.context.props.allNodes?.map(x => x.id) || [];
                
            if (!this.ciSysIds || this.ciSysIds.length === 0) {
                // page may not have initialized yet, set state to empty
                this.setEmptyState();
                return;
            }

            // Handle different event types
            if(event?.payload?.name === "timestamp") {
                this.handleTimestampEvent();
            } else if(event?.payload?.name === "allNodes") {
                this.handleAllNodesEvent();
            } else {
                this.handleStandardEvent();
            }
        },
        
        setEmptyState: function() {
            api.setState('relatedItemRecords', []);
            api.setState('relatedItemRecordsAll', []);
        },
        
        handleTimestampEvent: function() {
            if(event.payload.value) {
                api.setState("cache", {});
                this.setEmptyState();
                api.setState('relatedItemRecordsLoading', true);
                api.emit("SN_UNIFIED_MAP_CTRL#RELATED_ITEMS_DATA_LOADING");
                this.fetchRelatedItemRecords();
            }
        },
        
        fetchRelatedItemRecords: function(options = {}) {
            const payload = {
                "relatedItemCategorySysId": options.relatedItemCategorySysId || "",
                "ciList": options.ciList || this.ciSysIds,
                "workspaceId": api.context.app.appId,
                "configIdentifierId": api.context.props.configIdentifierId
            };
            
            if (options.allNodes) {
                payload.allNodes = options.allNodes;
                delete payload.ciList;
            }
            
            api.data.get_related_item_records.execute({ "payload": payload });
        },
        
        handleStandardEvent: function() {
          
            const sysidOrHash = getHash(this.ciSysIds);
            
            if (this.relatedItemCategorySysId && this.cache[sysidOrHash]?.[this.relatedItemCategorySysId]) {
                this.useExistingCategoryData(sysidOrHash);
            } else if (this.cache[sysidOrHash] && !this.relatedItemCategorySysId) {
                this.useExistingAllData(sysidOrHash);
            } else {
                this.fetchNewData();
            }
        },
        
        useExistingCategoryData: function(sysidOrHash) {
            api.setState('relatedItemRecords', this.cache[sysidOrHash][this.relatedItemCategorySysId]);
            api.setState('relatedItemRecordsAll', []);
            api.emit("SN_UNIFIED_MAP_CTRL#RELATED_ITEMS_DATA_READY", {
                relatedItemsData: {
                    allData: this.cache[sysidOrHash][this.relatedItemCategorySysId]
                }
            });
        },
        
        useExistingAllData: function(sysidOrHash) {
            const dataToDispatch = Object.values(this.cache[sysidOrHash]).flat();
            api.setState('relatedItemRecordsAll', dataToDispatch);
            api.setState('relatedItemRecords', []);
            api.emit("SN_UNIFIED_MAP_CTRL#RELATED_ITEMS_DATA_READY", {
                relatedItemsData: {
                    allData: dataToDispatch
                }
            });
        },
        
        fetchNewData: function() {
            api.setState('relatedItemRecordsLoading', true);
            api.emit("SN_UNIFIED_MAP_CTRL#RELATED_ITEMS_DATA_LOADING");
            this.fetchRelatedItemRecords({
                relatedItemCategorySysId: this.relatedItemCategorySysId
            });
        },
        
        handleAllNodesEvent: function() {
            const { getHash } = imports["sn_cmdb_ws.unifiedMapUtils"]();
            const allNodeSysIdHash = getHash(this.allNodesSysIds) + "ALLREL";
            let isAllRelatedItemRecordLoading = api.state.allRelatedItemRecordsLoading;
            
            if(!this.cache[allNodeSysIdHash] && !isAllRelatedItemRecordLoading && this.allNodesSysIds && this.allNodesSysIds.length > 0) {
                this.fetchAllNodesData(allNodeSysIdHash);
            } else if(this.cache[allNodeSysIdHash] && this.allNodesSysIds && this.allNodesSysIds.length > 0){
                this.useExistingAllNodesData(allNodeSysIdHash);
            }
        },
        
        fetchAllNodesData: function(allNodeSysIdHash) {
            this.cache[allNodeSysIdHash] = true;
            api.setState('allRelatedItemRecordsLoading', true);
            this.fetchRelatedItemRecords({
                relatedItemCategorySysId: [],
                ciList: [],
                allNodes: this.allNodesSysIds
            });
        },
        
        useExistingAllNodesData: function(allNodeSysIdHash) {
            api.emit("SN_UNIFIED_MAP_CTRL#ALL_RELATED_ITEMS_DATA_LOADED", {
                relatedItemsData: this.cache[allNodeSysIdHash]
            });
        }
    };

    handler.initialize();
}
