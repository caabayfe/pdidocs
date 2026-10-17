// We already ship necessary suggestion reader groups for these records OOTB
var OOTB_AIS_SACS = [
    '00731b9d5b231010d9a5ce1a8581c7dd', // Service Portal Default Search Application
    '7296910f53171010069addeeff7b12e7', // ESC Portal Default Search Application
];

var SUGGESTED_UTTERANCES = 'ab822a20ff0022103910ffffffffff7e';

var READER_GROUPS_TO_ADD = [{
    suggestion_type: 'ServiceNow Otto Suggested Query Reader Group for ',
    section_header: 'Ask ServiceNow Otto',
    limit: 3,
    click_in_mode: false,
    order: 250,
    readers: [{
        sys_suggestion_reader_id: SUGGESTED_UTTERANCES,
        order: 100,
    }, ],
    autoLink: false
}];

function readerGroupHasBeenCreatedForSAC(groupJson, sacGR) {
    var targetReaderGroupName = groupJson.suggestion_type + sacGR.getValue('name');
    var readerGroupGR = new GlideRecord('sys_suggestion_reader_group');
    readerGroupGR.addQuery('suggestion_type', targetReaderGroupName);
    readerGroupGR.query();
    return readerGroupGR.hasNext();
}

function createReaderGroupForSAC(groupJson, sacGR) {
    var readerGroupUtils = new SuggestionReaderGroupUtils();
    readerGroupUtils.createSingleSuggestionReaderGroup(groupJson, sacGR.getValue('sys_id'), sacGR.getValue('name'));
}

function tableExists(tableName) {
    return new TableUtils(tableName).tableExists();
}

var portalTable = 'sp_portal';
var searchApplicationTable = 'sys_search_context_config';

if (tableExists(portalTable) && tableExists(searchApplicationTable)) {
    var spGr = new GlideRecord(portalTable);
    spGr.addQuery('enable_ais', true);
    spGr.query();
    var portalSacs = [];
    while (spGr.next()) {
        var sacId = spGr.getValue('search_application');
        if (portalSacs.indexOf(sacId) == -1) {
            portalSacs.push(sacId);
        }
    }
    var sacGR = new GlideRecord(searchApplicationTable);
    sacGR.addQuery('search_engine', 'ai_search');
    sacGR.addQuery('sys_id', 'IN', portalSacs.join(','));
    sacGR.query();
    while (sacGR.next()) {
        if (OOTB_AIS_SACS.indexOf(sacGR.getValue('sys_id')) == -1) {
            for (var i = 0; i < READER_GROUPS_TO_ADD.length; i++) {
                var groupJson = READER_GROUPS_TO_ADD[i];
                if (!readerGroupHasBeenCreatedForSAC(groupJson, sacGR)) {
                    createReaderGroupForSAC(groupJson, sacGR);
                }
            }
        }
    }
}
