var rowCount = 0;
var bulkSize = parseInt(gs.getProperty('sn_itom_licensing.performance.config.bulksize', 5000));
var allowedSources = getDiscoverySources();
var excludedStatus = ['7', '8', '100']; // RETIRED, STOLEN, ABSENT
var dateFilter = 'Last 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()';
var HARDWARE_SUBCLASS_COUNTS_TABLE = "itom_lu_hardware_subclass_counts";
var pageLimit = 1000000;

function getDiscoverySources() {
    var allowedSources = [];
    var licenseDiscoverySourceGr = new GlideRecord('itom_lu_discovery_sources');
    licenseDiscoverySourceGr.query();
    while (licenseDiscoverySourceGr.next())
        allowedSources.push(licenseDiscoverySourceGr.getValue('source'));

    return allowedSources;
}

function getCountOfCi(table) {
    var count = 0;
    var last_executed_sys_id = '';
    var hasMoreRecords = true;
    while (hasMoreRecords) {
        var ciGr = new GlideRecord(table);
        if (last_executed_sys_id)
            ciGr.addQuery('sys_id', '>', last_executed_sys_id);
        if (table == 'cmdb_ci_hardware')
            ciGr.addQuery('sys_class_name', 'cmdb_ci_hardware');
        ciGr.addQuery('install_status', 'NOT IN', excludedStatus);
        ciGr.addQuery('duplicate_of', 'NULL');
        ciGr.orderBy('sys_id');
        ciGr.setLimit(pageLimit);
        ciGr.query();
        if (!ciGr.hasNext()) {
            break;
        }
        var ciList = [];
        while (ciGr.next()) {
            var sysId = ciGr.getValue('sys_id');
            ciList.push({
                'ciSysId': sysId
            });
            if (ciList.length >= bulkSize) {
                last_executed_sys_id = ciList[ciList.length - 1].ciSysId;
                ciList = _filterByDiscoverySource(ciList, false);
                count += ciList.length;
                ciList = [];
            }
        }
        if (ciList.length) {
            last_executed_sys_id = ciList[ciList.length - 1].ciSysId;
            ciList = _filterByDiscoverySource(ciList, false);
            count += ciList.length;
            ciList = [];
        }
    }
    return count;
}
// A VM can be discovered by both cloud discovery and IP based discovery to avoid
// counting the same node twice, find the CI's that have a Virtualized by::Virtualizes or
// Instantiates::Instantiated by relationship between cmdb_ci_vm_instance and cmdb_ci_server
// and deduct that from the total count
function getDoubleCountedCis() {

    var relGr = new GlideRecord('cmdb_rel_ci');
    relGr.addQuery('type.name', 'IN', 'Instantiates::Instantiated by, Virtualized by::Virtualizes');

    relGr.addQuery('parent.sys_class_name', 'INSTANCEOF', 'cmdb_ci_server');
    relGr.addQuery('parent.install_status', 'NOT IN', excludedStatus.join(","));
    relGr.addQuery('parent.duplicate_of', 'NULL');

    relGr.addQuery('child.sys_class_name', 'INSTANCEOF', 'cmdb_ci_vm_instance');
    relGr.addQuery('child.install_status', 'NOT IN', excludedStatus.join(","));
    relGr.addQuery('child.duplicate_of', 'NULL');

    relGr.query();
    var ciList = [];
    var count = 0;
    while (relGr.next()) {
        var sysId = relGr.getValue('parent');
        var exSysId = relGr.getValue('child');
        ciList.push({
            'ciSysId': sysId,
            'exCiSysId': exSysId
        });
        if (ciList.length == bulkSize) {
            ciList = _filterByDiscoverySource(ciList, true);
            count += ciList.length;
            ciList = [];
        }
    }
    if (ciList.length) {
        ciList = _filterByDiscoverySource(ciList, true);
        count += ciList.length;
        ciList = [];
    }
    return count;
}
// Batching of sys_object_source table
function _filterByDiscoverySource(ciList, relBased) {
    var ciMap = {};
    ciList.forEach(function(data) {
        if (relBased)
            ciMap[data.exCiSysId] = false;
        else
            ciMap[data.ciSysId] = false;
    });
    ciMap = this._processDiscoverySourceQuery(ciMap);
    return ciList.filter(function(data) {
        return relBased ? ciMap[data.exCiSysId] : ciMap[data.ciSysId];
    });
}

function _processDiscoverySourceQuery(ciMap) {
    var sysGr = new GlideRecord('sys_object_source');
    sysGr.addQuery('last_scan', 'ON', dateFilter);
    sysGr.addQuery('name', 'IN', allowedSources.join(","));
    sysGr.addQuery('target_sys_id', 'IN', Object.keys(ciMap).join(','));
    sysGr.query();
    while (sysGr.next()) {
        var ciSysId = sysGr.target_sys_id + '';
        ciMap[ciSysId] = true;
    }
    for (ci in ciMap)
        if (!ciMap[ci]) delete ciMap[ci];
    return ciMap;
}

function checkForParentTable(tableName, serialNum) {
    var gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    gr.addQuery('name', tableName);
    gr.query();
    if (!gr.next()) {
        gr.initialize();
        gr.setValue('serial_number', serialNum);
        gr.setValue('name', tableName);
        gr.setValue('count', 0);
        gr.setValue('ready_to_execute', false);
        gr.insert();
    }
}

function checkIfNewrecordsNeedToBeInserted() {
    checkForParentTable('cmdb_ci_hardware', 1);
    checkForParentTable('cmdb_ci_vm_instance', 2);
    var subClassGr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    subClassGr.query();
    var subClassRowCount = subClassGr.getRowCount() - 2;

    var dbObjectGr = new GlideRecord('sys_db_object');
    dbObjectGr.addEncodedQuery('super_class.label=hardware');
    dbObjectGr.query();

    if (dbObjectGr.getRowCount() == subClassRowCount) return;
    subClassRowCount += 3;
    while (dbObjectGr.next()) {
        var gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
        var tableName = dbObjectGr.getValue('name');
        gr.addQuery('name', tableName);
		gr.query();
        if (!gr.next()) {
            gr.initialize();
            gr.setValue('serial_number', subClassRowCount);
            gr.setValue('name', tableName);
            gr.setValue('count', 0);
            gr.setValue('ready_to_execute', false);
            gr.insert();
            subClassRowCount++;
        }
    }
}

function getCountOfexecutableClass() {
    var start_time = new GlideDateTime();
    var gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    gr.query();
    var subClassRowCount = gr.getRowCount();
    gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    gr.addQuery('ready_to_execute', true);
    gr.query();
    var serialNum;
    var ciCount = 0;
    if (gr.next()) {
        ciCount = getCountOfCi(gr.getValue('name'));
        serialNum = gr.getValue('serial_number');
    } else {
        gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
        gr.orderBy('end_time');
        gr.setLimit(1);
        gr.query();
		gr.next();
        ciCount = getCountOfCi(gr.getValue('name'));
        serialNum = gr.getValue('serial_number');
    }
    gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    gr.addQuery('serial_number', serialNum);
    gr.query();
    if (gr.next()) {
        gr.setValue('count', ciCount);
        gr.setValue('ready_to_execute', false);
        gr.setValue('start_time', start_time);
        gr.setValue('end_time', new GlideDateTime());
        gr.update();
    }

    serialNum++;
    serialNum %= subClassRowCount;
    if (serialNum === 0) serialNum = subClassRowCount;
    gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
    gr.addQuery('serial_number', serialNum);
    gr.query();
    if (gr.next()) {
        gr.setValue('ready_to_execute', true);
        gr.update();
    }
}

checkIfNewrecordsNeedToBeInserted();
getCountOfexecutableClass();

var gr = new GlideRecord(HARDWARE_SUBCLASS_COUNTS_TABLE);
gr.query();
while (gr.next()) {
    rowCount += parseInt(gr.getValue('count'));
}

var licenseExclusionGr = new GlideRecord('license_exclusion_list');
licenseExclusionGr.addEncodedQuery('exclusion_reason = d40277e75348301046dfddeeff7b12e2');
licenseExclusionGr.query();
rowCount -= licenseExclusionGr.getRowCount();
if (rowCount <= 0) rowCount = 0;

var countGr = new GlideRecord("itom_lu_definition_usage_count");
countGr.addQuery("name", "hardware");
countGr.query();
if (countGr.next()) {
    countGr.setValue("count", rowCount);
    countGr.setValue("name", "hardware");
    countGr.update();
} else {
    countGr.initialize();
    countGr.setValue("count", rowCount);
    countGr.setValue("name", "hardware");
    countGr.insert();
}
