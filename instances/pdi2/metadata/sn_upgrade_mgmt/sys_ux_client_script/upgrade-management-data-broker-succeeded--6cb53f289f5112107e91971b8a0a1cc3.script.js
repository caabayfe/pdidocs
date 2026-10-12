/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const response = api?.data?.upgrade_management___get_upgrade_details_1?.output;

    if(!response) {
        api.setState("testGeneratorUrl", "now/nav/ui/classic/params/target/install_atf_test_generator.do");
    }
}
