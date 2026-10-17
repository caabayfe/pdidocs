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

    const CATEGORY_DORMANT = 'dormant';
    const CATEGORY_BASIC_AUTH = 'basic_auth';
    const CATEGORY_WSA_FALSE = 'wsa_false';
    const CATEGORY_UI_LOGIN_AND_INTEGRATION = 'ui_login_and_integration';

    function dataBrokerHandler() {
        if (hasServerError()) {
            return;
        }

        let complianceScore = event.payload.data.output.response;
        var categoryConf = api.state.categoryConf;
        complianceScore.forEach(category => {
            let conf = categoryConf[category.name];
            category.icon = conf.icon;
            category.route = conf.route;
            category.score = category.score + '%';
            category.scoreImpact = category.scoreImpact + '%';
        });

        translate(complianceScore).then(() => api.setState("complianceScore", complianceScore));
    }

    function translate(complianceScore) {

        var promises = [];
        const fmt = Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2
        });

        complianceScore.forEach(category => {
            var findings = fmt.format(category.riskyMI || 0);
            switch (category.name) {
                case CATEGORY_DORMANT:
                    promises.push(
                        helpers.translate("Accounts with no login for 100 days - {0} findings", findings),
                        helpers.translate("Accounts that have not accessed any API in 100 days."));
                    break;
                case CATEGORY_BASIC_AUTH:
                    promises.push(
                        helpers.translate("Accounts using Basic Authentication - {0} findings", findings),
                        helpers.translate("Accounts that are using username and password for authentication."));
                    break;
                case CATEGORY_WSA_FALSE:
                    promises.push(
                        helpers.translate("Integration accounts with Web Service Access disabled - {0} findings", findings),
                        helpers.translate("All accounts that have WSA disabled."));
                    break;
                case CATEGORY_UI_LOGIN_AND_INTEGRATION:
                    promises.push(
                        helpers.translate("Accounts performing both UI and API logins - {0} findings", findings),
                        helpers.translate("Accounts that are used for both interactive (UI) and machine (API) logins."));
                    break;
            }
        });

        return new Promise(resolve => Promise.all(promises).then(translatedText => {
            updateTranslatedText(complianceScore, translatedText);
            resolve();
        }));
    }

    function updateTranslatedText(complianceScore, translatedText) {
        var i = 0;
        complianceScore.forEach(category => {
            category.title = translatedText[i++];
            category.description = translatedText[i++];
        });
    }

    function navigateToListPage() {
        helpers.navigate.to(event.context.item.value.route.name, event.context.item.value.route.fields);
    }

    /**
     * It will return true, if has server error and handled otherwise false
     */
    function hasServerError() {
        if (event.name == "DATA_OP_FAILED") {
            api.setState('serverError', true);
            return true;
        }
        return false;
    }

    switch (event.elementId) {
        case 'machine_identity_data_broker':
            dataBrokerHandler();
            break;
        case 'title':
            navigateToListPage();
            break;
    }
}
