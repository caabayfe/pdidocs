function transform(input) {
    var perfMetrics;
    if (input.perfLogging) {
        //capture timestamps for
        // 1) end of uxf getMap outbound call time
        // 2) start of total backend time
        var now = Date.now();
        perfMetrics = {
            uxf_getmap_outbound_call_time: { end: now },
            total_backend_time: { start: now }
        };
    }
    var unifiedMapHelper = new UnifiedMapHelper();
    var sysid = input.sysid.trim();
    var properties = unifiedMapHelper.getConfigPropertyValues({
        workspaceId: input.appId,
        configIdentifierId: input.configIdentifierId,
        properties: ['unifiedmap.map_search_filter.default_levels', 'unifiedmap.map_search_filter.max_levels']
    }).result;
    var defaultLevels = properties['unifiedmap.map_search_filter.default_levels'];
    var levels = parseInt(input.levels) || parseInt(defaultLevels);
    var maxLevels = parseInt(properties['unifiedmap.map_search_filter.max_levels']);

    if (levels > maxLevels) {
        levels = maxLevels;
    } else if (levels < 1) {
        levels = 1;
    }

    var workspaceUtil = new CMDBWorkspaceUtil();
    var allowEditMode = workspaceUtil.userCanPerformUMEdits();
    var canManageSharedPreset = workspaceUtil.userCanManageSharedPreset();
    var result = {
        sysid: sysid,
        levels: levels,
        allowEditMode: allowEditMode,
        canManageSharedPreset: canManageSharedPreset,
        appId: input.appId,
        perfLogging: input.perfLogging,
        errors: [],
        messages: [],
        rawData: {}
    };

    try {
        if (!sysid) {
            var util = new MapErrorUtility();
            result.errors.push({
                code: util.CMDBUM_400_001,
                message: util.ERROR_CODES['CMDBUM-400-001']
            });
        } else if (!levels) {
            result.errors.push({
                code: util.CMDBUM_400_003,
                message: util.ERROR_CODES['CMDBUM-400-003']
            });
        } else {
            var response = unifiedMapHelper.getMap({ 
                ciSysId: sysid, 
                level: levels, 
                appId: input.appId,
                perfLogging: input.perfLogging,
                serviceMappingInput: input.serviceMappingInput,
                configIdentifierId: input.configIdentifierId
            });
            if (response.success) {
                result.rawData = response.result;
                result.messages = response.messages;
            } else {
                gs.error('CMDB Workspace - Unified Map - Error encountered fetching server data calling script include UnifiedMapHelper().getMap(' + sysid + ', ' + levels + '). ' + 
                    response.error.code + ': ' + response.error.message);
                result.errors.push({
                    code: response.error.code,
                    message: response.error.message,
                    uiMessage: response.error.uiMessage
                });
            }
        }
    } catch (error) {
        result.errors.push(error.toString());
    }

    if (input.perfLogging) {
        //capture timestamps for
        // 1) end of total backend time
        // 2) start of uxf inbound return time
        var now2 = Date.now();
        perfMetrics.total_backend_time.end = now2;
        perfMetrics.uxf_getmap_inbound_return_time = { start: now2 };

        //add perf times in this script to the perfMetrics returned from getMap
        var deepMerge = function (obj1, obj2) {
            var obj3 = {};

            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    obj3[key] = obj1[key];
                }
            }

            for (var key2 in obj2) {
                if (obj2.hasOwnProperty(key2)) {
                    if (typeof obj3[key2] === "object" && typeof obj2[key2] === "object") {
                        obj3[key2] = deepMerge(obj3[key2], obj2[key2]);
                    } else {
                        obj3[key2] = obj2[key2];
                    }
                }
            }

            return obj3;
        };
        var combinedPerfMetrics = deepMerge(result.rawData.perfMetrics, perfMetrics);
        result.rawData.perfMetrics = combinedPerfMetrics;
    }
    /* TODO: Add back commented lines  when mapDataFetchFailed flow enabled (STRY57881588 will address this)
    if(result.errors && result.errors.length > 0) {
        throw JSON.stringify(result);
    }*/
    return result;
}
