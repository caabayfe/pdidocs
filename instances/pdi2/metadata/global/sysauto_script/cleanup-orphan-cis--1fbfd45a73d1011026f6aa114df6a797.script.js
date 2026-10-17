function process() {
    // Start timer
    var timeStart = new Date();
    var timeSpent = 0;
    // Max amount of time we want to process
    var maxTime = parseInt(gs.getProperty('cmdb.orphan.job.max.runtime', 30 * 60)); // 30 mins
    var dependentCIHelper = new DependentCIHelper();
    var jobUtil = new CleanupOrphanJobUtil();
    // Lower the log setting for CMDB Dependent CI class 
    jobUtil.lowerLogLevel();
    var rerun = false;
    var ext = GlideDBObjectManager.get().getAllExtensions('cmdb_ci');
    for (var x = 0; x < ext.size(); ++x) {
        var cmdbTable = ext.get(x);
        if (dependentCIHelper.isDependentClass(cmdbTable)) {
            //  walk up to top-most dependent parent
            var tableList = jobUtil.getParents(cmdbTable);
            for (var y = 0; y < tableList.length - 1; ++y) {
                var tableParent = tableList[y];
                var tableGrandParent = tableList[y + 1];
                if (dependentCIHelper.isDependentClass(tableParent) && !dependentCIHelper.isDependentClass(tableGrandParent)) {
                    var tableBookmark = jobUtil.getBookmarkForTable(tableParent);
                    if (!gs.nil(tableBookmark)) {
                        // parse
                        var parser = new JSONParser();
                        tableBookmark = parser.parse(tableBookmark);
                        if (tableBookmark[jobUtil.MARKER] === jobUtil.FINISHED_STR) {
                            continue;
                        }
                    } else {
                        tableBookmark = {};
                    }
                    rerun = true;
                    var processResult = processTable(tableParent, timeStart, timeSpent, maxTime, tableBookmark);
                    timeSpent = processResult['timeSpent'];
                    // Update bookmark
                    jobUtil.setBookmarkForTable(tableParent, JSON.stringify(processResult['bookmark']));
                    if (timeSpent >= maxTime) {
                        jobUtil.restoreLogLevel();
                        return;
                    }
                }
            }
        }
    } // end for
    if (!rerun) {
        // Disable self
        jobUtil.disableJob();
    }
    // Restore log level to original 
    jobUtil.restoreLogLevel();
}
function processTable(ciTable, timeStart, timeSpent, maxTime, bookmark) {
    var result = {};
    var dependentCIHelper = new DependentCIHelper();
    var jobUtil = new CleanupOrphanJobUtil();
    var batchSize = parseInt(gs.getProperty('cmdb.orphan.job.query.batchsize', 10000));
    var start = 0;
    var end = batchSize;
    var markerTimeStamp = bookmark[jobUtil.MARKER];
    var markerSysId = bookmark[jobUtil.MARKER_SYS_ID];
    // Check if this is the first call to this table, if yes, set total count
    bookmark = jobUtil.checkAndSetTotalCount(bookmark, ciTable);
    var orphanCount = jobUtil.getOrphanCount(bookmark);
    while (timeSpent < maxTime) {
		var encodedQuery = getEncodedQuery(markerSysId, markerTimeStamp);
        var gr = new GlideRecord(ciTable);
        if (JSUtil.notNil(encodedQuery)) {
            gr.addEncodedQuery(encodedQuery);
        }
        gr.orderBy('sys_updated_on');
        gr.orderBy('sys_id');
        gr.chooseWindow(0, batchSize);
        gr.query();
        if (!gr.hasNext()) {
            bookmark[jobUtil.MARKER] = jobUtil.FINISHED_STR;
            bookmark[jobUtil.ORPHAN_CI_COUNT] = orphanCount;
            // This has been processed
            result['bookmark'] = bookmark;
            timeSpent = getTimeSpent(timeStart, timeSpent);
            result['timeSpent'] = timeSpent;
            return result;
        }
        while (gr.next()) {
            var sysId = gr.getUniqueValue();
            if (SNC.CMDBDataManagerScriptableApis.isOrphanedDependent(sysId)) {
                dependentCIHelper.addOrphanCIToLedger(sysId);
                orphanCount++;
            }
            markerTimeStamp = gr.getDisplayValue('sys_updated_on');
            markerSysId = sysId;
        }
        timeSpent = getTimeSpent(timeStart, timeSpent);
    }
    // update bookmarked value
    bookmark[jobUtil.MARKER] = markerTimeStamp.toString();
	bookmark[jobUtil.MARKER_SYS_ID] = markerSysId;
    // update orphan count
    bookmark[jobUtil.ORPHAN_CI_COUNT] = orphanCount;
    result['bookmark'] = bookmark;
    result['timeSpent'] = timeSpent;
    return result;
}
function getTimeSpent(timeStart, timeSpent) {
    var timeEnd = new Date();
    var timeDiff = timeEnd - timeStart; //in ms
    // strip the ms
    timeDiff /= 1000;
    // get seconds 
    var seconds = Math.round(timeDiff);
    timeSpent = timeSpent + seconds;
    return timeSpent;
}
function getEncodedQuery(markerSysId, markerTimeStamp) {
    if (JSUtil.nil(markerSysId) || JSUtil.nil(markerTimeStamp)) {
        return null;
    }
    var dateTime = markerTimeStamp.split(" ");
    if (dateTime.length >= 2) {
        var date = dateTime[0];
        var time = dateTime[1];
        var queryStringForTimeStamp = "javascript:gs.dateGenerate('" + date + "','" + time + "')";
        var encodedQuery = "sys_id>" + markerSysId + "^sys_updated_on=" + queryStringForTimeStamp + "^NQsys_updated_on>" + queryStringForTimeStamp;
        return encodedQuery;
    }
    return null;
}
process();
