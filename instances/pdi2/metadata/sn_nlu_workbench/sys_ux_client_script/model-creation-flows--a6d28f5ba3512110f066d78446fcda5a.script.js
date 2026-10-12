
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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
	var { blockcontext } = eventPayload;
    var lastOpenedModal = '';

    function openModal(modalId) {
        aceUtils.dismissModal();
        lastOpenedModal = modalId;
        aceUtils.openModal(modalId); 
    }

    function resetBlockContextVariables () {
        blockcontext.modelName = '';
        blockcontext.modelPrimaryLanguage = 'en';
        blockcontext.modelShortDescription = '';
        blockcontext.modelCategory = '';
        blockcontext.modelDomain = [];
        blockcontext.modelNameErrors = [];
        blockcontext.modelShortDescLengthError = [];
        blockcontext.preBuiltModelId = '';
        blockcontext.preBuiltModelIntents = [];
        blockcontext.disableNextButton = true;
        blockcontext.selectPrebuiltModelError = [];
        blockcontext.csvModelCreation = '';
        blockcontext.modelCSVFileName = null;
        blockcontext.modelCSVSelectedFile = null;
        blockcontext.form_data = null;
        blockcontext.csvModelId = '';
        blockcontext.csvModelCreation = '';
        blockcontext.modelCSVStagingTable = '';
        aceUtils.setContext(blockcontext);
        aceUtils.dismissModal();
    }
    // element-id of modals
    const CREATE_MODEL_FROM = 'cc08-3a0c-b8aa9b-8327-baa8eeb8';
    const CREATE_MODEL_FORM_DETAILS = '01d3-7000-b898ab-696c-aa9893ba';
    const IMPORT_FROM_CSV_STAGE_2 = '6338-ee3a-a889aa-4538-b899998b';
    const PREBUILT_MODEL_STAGE_2 = '40e1-b840-989aa9-6309-889b8588';
    const PREBUILT_MODEL_STAGE_3 = 'd467-91fd-988b9b-9734-bb8ae88b';
    const CREATING_MODEL_LOADING_SCREEN = 'a6a3-4593-989aa9-7bcf-aabb1898';
    const MODEL_CREATED = '6fc8-711d-b99999-d503-988b72ab';
    const CANCEL_MODEL_CREATION_ALERT = 'c213-8176-89bab8-4cae-aa8bad99';
    switch (eventName) {

        case 'MODEL_LANGUAGE_SELECTED':
            blockcontext.modelPrimaryLanguage = eventPayload.value;
            blockcontext.alertMessageForLang = [];
            blockcontext.VALanguages.find(function(lang) {
                if(lang.value === eventPayload.value && lang.intentOnly) {
                    blockcontext.alertMessageForLang = [{
                        "icon": "circle-exclamation-outline",
                        "content": "Note: This language doesn't support entities."
                    }];
                    return true;
                }
            })
            aceUtils.setContext(blockcontext);
            break;
    
        case 'VIEW_MODEL_CLICKED':
            const navigateTo = blockcontext.modelSysId;
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: navigateTo,
                    target: '_blank'
                }
            });
            resetBlockContextVariables();
            break;
        case 'CLOSE_MODEL_CREATED_MODAL':
            resetBlockContextVariables();
            break;
            
        case "REMOVE_MODEL_CSV_FILE":
            aceUtils.getContext().then((response) => {
                var newBlockContext = response;
                newBlockContext.modelCSVFileName = null;
                newBlockContext.modelCSVSelectedFile = null;
                newBlockContext.disableNextButton = true;
                aceUtils.setContext(newBlockContext);
            });
            break;
        case "IMPORT_FROM_CSV_STAGE_2_SUBMIT":
            blockcontext.modelCSVFileName = null;
            blockcontext.modelCSVSelectedFile = null;
            blockcontext.form_data = null;
            blockcontext.csvModelId = '';
            blockcontext.disableNextButton = true;
            blockcontext.csvModelCreation = '';
            blockcontext.modelCSVStagingTable = '';
            blockcontext.modelName = '';
            blockcontext.modelPrimaryLanguage = 'en';
            blockcontext.modelShortDescription = '';
            blockcontext.modelCategory = '';
            blockcontext.modelDomain = [];
            blockcontext.modelNameErrors = [];
            blockcontext.modelShortDescLengthError = [];
            aceUtils.setContext(blockcontext);
            aceUtils.openModal(MODEL_CREATED);
            break;
            
        case "MODEL_CSV_FILE_SET":
            blockcontext.modelCSVFileName = {
                "name": eventPayload.file.name
            };
            blockcontext.fileUploading = true;
            blockcontext.modelCSVSelectedFile = eventPayload.file;
            if(blockcontext.csvModelCreation === 'created' && blockcontext.modelCSVFileName?.name) {
                blockcontext.disableNextButton = false;
                blockcontext.fileUploading = false;
            }
            aceUtils.setContext(blockcontext);
            if(['in-progress', 'created'].includes(blockcontext.csvModelCreation)){
                return;
            }
            blockcontext.csvModelCreation = 'in-progress';
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('create_model_from_csv').then(() => {
                aceUtils.getContext().then(response => {
                    var newBlockContext = response;
                    if(newBlockContext.csvModelCreation === 'created' && newBlockContext.modelCSVFileName?.name)
                        newBlockContext.disableNextButton = false;
                        newBlockContext.fileUploading = false;
                    var form_data = {
                        "sysparm_import_set_tablename": newBlockContext.modelCSVStagingTable,
                        "sysparm_transform_after_load": true,
                        "sysparm_transaction_scope": "31f5f491c3a710100bf407720f40ddf4"
                    };
                    newBlockContext.endpoint = "/sys_import.do";
                    newBlockContext.form_data = form_data;
                    aceUtils.setContext(newBlockContext);
                });
            })
            break;

        case "CREATE_NEW_MODEL_CLICKED":
            if(blockcontext.currentTab === 'virtual_agent'){
                if(!blockcontext.VALanguages){
                    aceUtils.refreshContentBlock('get_model_languages');
                }
                else {
                    blockcontext.modelLanguages = blockcontext.VALanguages;
                    aceUtils.setContext(blockcontext);
                }
            }
            else if(blockcontext.currentTab === 'search'){
                if(!blockcontext.aiSearchLanguages){
                    aceUtils.refreshContentBlock('get_model_languages')
                }
                else {
                    blockcontext.modelLanguages = blockcontext.aiSearchLanguages;
                    aceUtils.setContext(blockcontext);
                }
            }
            aceUtils.openModal(CREATE_MODEL_FROM);
            break;
        
        case "CONTINUE_MODEL_CREATION":
            aceUtils.dismissModal();
            aceUtils.setContext(blockcontext);
            aceUtils.openModal(lastOpenedModal);
            break;

        case "CANCEL_MODEL_CREATION":
            if(blockcontext.createModelFrom === 'csv' && blockcontext.csvModelId) {
                aceUtils.refreshContentBlock('delete_model_from_csv').then((response) => {
                    resetBlockContextVariables();
                });
            }
            else {
                resetBlockContextVariables();
            }

            break;
            
        case "PRE_BUILT_INTENT_SEARCH":
            blockcontext.filteredUttrEntityCount.rows = blockcontext.uttrEntityCount?.rows?.filter((ele) => {
                return ele?.cells?.Intent?.value?.toLowerCase().includes(eventPayload.fieldValue.toLowerCase());
            });
            aceUtils.setContext(blockcontext);
            break;

        case "PRE_BUILT_INTENT_SELECTED":
            var { checked, value } = eventPayload;
            if(checked) {
                if(typeof value === "string") {
                    blockcontext.preBuiltModelIntents.push(value);
                }
                else if(typeof value === "object") {
                    value.forEach(function (rowId) {
                        blockcontext.preBuiltModelIntents.push(rowId);
                    });
                }
            }
            else {
                if(typeof value === 'string') {
                    blockcontext.preBuiltModelIntents = blockcontext.preBuiltModelIntents.filter(function (rowId) {
                        return rowId !== value;
                    });
                }
                else if(typeof value === 'object') {
                    blockcontext.preBuiltModelIntents = blockcontext.preBuiltModelIntents.filter(function (rowId) {
                        return !value.includes(rowId)
                    });
                }
            }
            blockcontext.filteredUttrEntityCount.rows.map((row) => {
                row.isSelected = blockcontext.preBuiltModelIntents.includes(row.key) ? true : false;
            });
            blockcontext.uttrEntityCount.rows.map((row) => {
                row.isSelected = blockcontext.preBuiltModelIntents.includes(row.key) ? true : false;
            });
            if(blockcontext.preBuiltModelIntents.length < 1)
                blockcontext.disableNextButton = true;
            else
                blockcontext.disableNextButton = false;
            aceUtils.setContext(blockcontext);
            break;

        case "START_FROM_BLANK_CLICKED":
            blockcontext.createModelFrom = 'blank';
            blockcontext.createModelHeaderTitle = await helpers.translate('Start from blank');
            blockcontext.showModelFormStepper2 = false;
            blockcontext.showModelFormStepper3 = false;
            aceUtils.setContext(blockcontext);
            openModal(CREATE_MODEL_FORM_DETAILS);
            break;

        case "IMPORT_DATA_FROM_CSV_CLICKED":
            blockcontext.createModelFrom = 'csv';
            blockcontext.createModelHeaderTitle = await helpers.translate('Import data from CSV');
            blockcontext.showModelFormStepper2 = true;
            blockcontext.showModelFormStepper3 = false;
            aceUtils.setContext(blockcontext);
            openModal(CREATE_MODEL_FORM_DETAILS);
            break;

        case "USE_PRE_BUILT_MODEL_DATA_CLICKED":
            blockcontext.createModelFrom = 'pre-built';
            blockcontext.createModelHeaderTitle = await helpers.translate('Create using pre-built model');
            blockcontext.showModelFormStepper2 = false;
            blockcontext.showModelFormStepper3 = true;
            aceUtils.setContext(blockcontext);
            openModal(CREATE_MODEL_FORM_DETAILS);
            break;

        case "ON_MODEL_FORM_DETAILS_SUBMIT":
            const modelNameLength = blockcontext.modelName?.length;
            const shortDescriptionLength = blockcontext.modelShortDescription?.length;
            var errorsExist = false;
            // Validation for model name field
            if (modelNameLength == 0 && modelNameLength < 3) {
                errorsExist = true;
                blockcontext.modelNameErrors = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("This field cannot be empty")
                }, {
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("The name must be at least 3 characters long")
                }]
            } else if (modelNameLength == 0) {
                errorsExist = true;
                blockcontext.modelNameErrors = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("This field cannot be empty")
                }];
            } else if (modelNameLength < 3) {
                errorsExist = true;
                blockcontext.modelNameErrors = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("The name must be at least 3 characters long")
                }];
            } else if (modelNameLength > 40) {
                errorsExist = true;
                blockcontext.modelNameErrors = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("The name must be at most 40 characters long")
                }];
            } else {
                blockcontext.modelNameErrors = [];
            }

            // Validation for short description field
            if (shortDescriptionLength > 512) {
                errorsExist = true;
                blockcontext.modelShortDescLengthError = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("The short description must be at most 512 characters long")
                }];
            } else {
                blockcontext.modelShortDescLengthError = [];
            }

            if (errorsExist) {
                aceUtils.setContext(blockcontext);
                return;
            } else {
                errorsExist = false;
                aceUtils.setContext(blockcontext);
            }

            var createModelFrom = blockcontext.createModelFrom;
            if (createModelFrom == 'blank') {
                aceUtils.openModal(CREATING_MODEL_LOADING_SCREEN);
                aceUtils.refreshContentBlock('insert_nlu_model').then(() => {
                    aceUtils.getContext().then(response => {
                        var newBlockContext = response;
                        newBlockContext.modelName = '';
                        newBlockContext.modelPrimaryLanguage = 'en';
                        newBlockContext.modelShortDescription = '';
                        newBlockContext.modelCategory = '';
                        newBlockContext.modelDomain = [];
                        newBlockContext.modelNameErrors = [];
                        newBlockContext.modelShortDescLengthError = [];
                        aceUtils.setContext(newBlockContext);
                        aceUtils.openModal(MODEL_CREATED);
                    });
                })
            } else if (createModelFrom == 'csv') {
                openModal(IMPORT_FROM_CSV_STAGE_2);
            } else if (createModelFrom == 'pre-built') {
                aceUtils.refreshContentBlock('get_prebuit_nlu_models').then((response) => {
                    openModal(PREBUILT_MODEL_STAGE_2);
                });
            }
            break;
        case 'PREBUILT_MODEL_STAGE_2_SUBMIT':
            if (!blockcontext.preBuiltModelId) {
                blockcontext.selectPrebuiltModelError = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("This field is required")
                }];
                aceUtils.setContext(blockcontext);
                return;
            } else {
                blockcontext.selectPrebuiltModelError = [];
            }
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('get_utterance_entity_count_from_model_ID').then(() => {
                openModal(PREBUILT_MODEL_STAGE_3);
            })
            break;
        case 'PREBUILT_MODEL_STAGE_3_SUBMIT':
            const opts = {
                model_props: {
                    display_name: blockcontext.modelName,
                    description: blockcontext.modelShortDescription,
                    language: blockcontext.modelPrimaryLanguage,
                    filter: {
                        intents: blockcontext.preBuiltModelIntents
                    }
                }
            }
            aceUtils.openModal(CREATING_MODEL_LOADING_SCREEN);
            helpers.snHttp('/api/now/v1/nlu/clonemodel', {
                method: 'POST',
                body: {
                    sysId: blockcontext.preBuiltModelId,
                    opts
                }
            }).then(response => {
                blockcontext.modelSysId = '/$nlu-studio.do#/model-overview/' + response.response.result.sysId;
                blockcontext.modelShortDescription = '';
                blockcontext.modelName = '';
                blockcontext.modelPrimaryLanguage = 'en';
                blockcontext.modelDomain = [];
				blockcontext.modelNameErrors = [];
				blockcontext.modelShortDescLengthError = [];
                aceUtils.setContext(blockcontext);
                aceUtils.openModal(MODEL_CREATED);
            });
            break;
        case 'PRE_BUILT_STEPPER_STAGE_2':
            if (eventPayload.value === "Add details") {
                openModal(CREATE_MODEL_FORM_DETAILS);
            }
            break;
        case 'PRE_BUILT_STEPPER_STAGE_3':
            if (eventPayload.value === "Add details") {
                openModal(CREATE_MODEL_FORM_DETAILS);
            }
            else if (eventPayload.value === "Select pre-built model") {                            
                openModal(PREBUILT_MODEL_STAGE_2);
            }
            break;
        
        case 'GO_BACK_TO_FORM_DETAILS':
            openModal(CREATE_MODEL_FORM_DETAILS);
            break;

        case 'GO_BACK_TO_PREBUILT_STAGE_2':
            openModal(PREBUILT_MODEL_STAGE_2);
            break;
    }
}
