// We already ship necessary suggestion reader groups for these records OOTB
var OOTB_AIS_SACS = [
    '00731b9d5b231010d9a5ce1a8581c7dd', // Service Portal Default Search Application
    '7296910f53171010069addeeff7b12e7', // ESC Portal Default Search Application
    '9feafee55b7120109779b9a23381c768', // Help Panel Search Application
    '6ebf8fe1531201107f03ddeeff7b122b', // Global search (SAC: [AIS] Now Experience Search Configuration)

    // These don't get any Suggestion Readers
    '2963a5fa530020103296ddeeff7b129f', // Virtual Agent Default Search Application
    '2056f9de67621010b3d782f45685efd0', // [AI Search Assist] - Incident Deflection
];

var USER_SEARCH_TERM_READER = '4b1cb27053231010dda1ddeeff7b12b8';
var USER_HISTORY_AND_CLICK_READER = 'f8495b9077210110be280d892c5a9986';
var QUERY_CONTENT_READER = 'c41365e077020110be280d892c5a99f2';

var READER_GROUPS_TO_ADD = [{
        suggestion_type: 'User History Reader Group for ',
        section_header: 'Recently viewed',
        limit: 5,
        click_in_mode: false,
        order: 500,
        readers: [{
                sys_suggestion_reader_id: USER_SEARCH_TERM_READER,
                order: 100,
            },
            {
                sys_suggestion_reader_id: USER_HISTORY_AND_CLICK_READER,
                order: 200,
            }
        ],
        autoLink: false
    },
    {
        suggestion_type: 'Search-based Suggested Results Reader Group for ',
        section_header: 'Suggested',
        limit: 5,
        click_in_mode: false,
        order: 600,
        readers: [{
            sys_suggestion_reader_id: QUERY_CONTENT_READER,
            order: 100,
        }, ],
        autoLink: false
    }
];

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

var sacGR = new GlideRecord('sys_search_context_config');
sacGR.addQuery('search_engine', 'ai_search');
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
