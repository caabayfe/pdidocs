/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

async function setwarningMsg(){
     let miningWarningMsg = "";
        if (api.state.isAvailableVersionPresent) {
            miningWarningMsg += await helpers.translate("Mining this project may take a long time, during which the model graph cannot be explored. ");
        }
        if (!api.state.isPlaybookSourceTypeProject && api.state.projectData.findingsCount == 0 && api.state.projectData.automatedFindingsCount == 0) {
            miningWarningMsg += await helpers.translate("Please note that no improvement opportunity definitions have been added into your project. The mining process will be carried out without them. ");
        }
        if (api.context.session.user.userName != api.state.projectData.createdBy) {
            miningWarningMsg += await helpers.translate("Note: Mining results will be based on creator access {0} ", api.state.projectData.createdBy);
        }
        if (miningWarningMsg.length > 0) {
            api.setState('miningWarningMsg', miningWarningMsg);
        }
}
        if (api.state.projectData.ismining) {
            helpers.modal.open("[component-id$='mining_summary']");
        } else {
            if (!api.state.isPlaybookSourceTypeProject) {
                await setwarningMsg();
            }
            helpers.modal.open("[component-id$='select_mining_type_modal']");
              api.setState('projectData', { ...api.state.projectData,
                showSummary: false,
                iframeURL: ''
            });
        }
}
