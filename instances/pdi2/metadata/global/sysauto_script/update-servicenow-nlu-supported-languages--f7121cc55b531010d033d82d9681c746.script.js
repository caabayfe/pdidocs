var OPEN_NLU_DRIVER_LANGUAGE_TABLE = 'open_nlu_driver_language';
var SERVICE_NOW_NLU_SYS_ID = '64c023c17300330021a044764df6a70e';

var allLanguages = fetchListOfSupportedLanguages();
var currentLanguages = getCurrentListOfSupportedLanguages();

updateSupportedLanguages(currentLanguages, allLanguages);

function updateSupportedLanguages(currentLanguages, allLanguages) {
    for (var i = 0; i < allLanguages.length; i++) {
        // insert languages that are not currently supported
        if (currentLanguages.indexOf(allLanguages[i].language) == -1) {
            var gr = new GlideRecord(OPEN_NLU_DRIVER_LANGUAGE_TABLE);
            gr.newRecord();
            gr.driver = SERVICE_NOW_NLU_SYS_ID;
            gr.language = allLanguages[i].name;
            gr.code = allLanguages[i].language;
            gr.driver_codes = allLanguages[i].language;
            gr.insert();
        }
    }
}

function fetchListOfSupportedLanguages() {
	var response = [];
	try {
		response = JSON.parse(sn_ml.MLServiceUtil.fetchGraphQL('query{NLU{supportedLanguages{name,language}}}'));
		if (response.data !== null) {
			return response.data.NLU.supportedLanguages;
		}
		return response;
	}
	catch (exception) {
		gs.error('Error fetching from sn_ml.MLServiceUtil ' + exception);
	}
}

function getCurrentListOfSupportedLanguages() {
    var currentSupportedLanguages = [];
    var gr = new GlideRecord(OPEN_NLU_DRIVER_LANGUAGE_TABLE);
    gr.addEncodedQuery('driver=' + SERVICE_NOW_NLU_SYS_ID);
    gr.query();
    while (gr.next()) {
        currentSupportedLanguages.push(gr.getValue('code'));
    }
    return currentSupportedLanguages;
}
