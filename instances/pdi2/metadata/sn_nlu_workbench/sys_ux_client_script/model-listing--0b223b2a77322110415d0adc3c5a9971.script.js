
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
    let {
        blockcontext,
        item
    } = eventPayload;

    function clearTranslationVariables () {
        blockcontext.thirdPartyTranslateSelected = false;
        blockcontext.machineTranslateSelected = false;
        blockcontext.noTraslationSelected = true;
        blockcontext.useAIInteraction = 'select';
        blockcontext.useThirPartyInteraction = 'select';
        blockcontext.noTranslateInteraction = 'select';
        blockcontext.languageForTranslation = '';
        blockcontext.modeOfTranslation = 'manual';
        blockcontext.modelForTranslation = '';
        blockcontext.disableAddALanguage = true;
        blockcontext.primaryLanguageOfTranslationModel = '';
        blockcontext.languagesAvlbForTranslation = [];
        blockcontext.modelNameForSelectedAction = '';
        blockcontext.modeNotAvlbText = '';
        blockcontext.showTextForThirdPartyMode = false;
        blockcontext.showTextForAIMode = false;
        aceUtils.setContext(blockcontext);
    }

    function clearDuplicateModelVariables (blockcontext) {
        blockcontext.modelToDuplicateName = '';
        blockcontext.modelToDuplicateSysId = '';
        blockcontext.duplicateThisModelSubtitle = ''
        blockcontext.isGroupClone = false;
        blockcontext.primaryLanguageOfCloneModel = '';
        blockcontext.actualPrimaryLanguageForCloning = '';
        blockcontext.primaryLanguagesForCloning = [];
        blockcontext.secondaryLanguagesOfCloneModel = [];
        blockcontext.selectedSecondaryLangsForCloning = [];
        blockcontext.languagesOfSelectedModel = [];
        blockcontext.primaryLanguageChangedWarning = [];
        blockcontext.modelNameErrors = [];
        blockcontext.modelShortDescLengthError = [];
        blockcontext.secondaryLangAlert = [];
        aceUtils.setContext(blockcontext);
    }

    function addNotification(notificationId, status, icon, message) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: notificationId,
                status: status,
                icon: icon,
                content: {
                    type: "html",
                    value: message
                },
                action: {
                    type: "dismiss"
                },
            }]
        });
    }

    function getLanguageNames(primaryLanguage = '', secondaryLanguages = []) {
        var languages = primaryLanguage;
        secondaryLanguages.forEach((lang, idx) => {
            if (idx === secondaryLanguages.length - 1) {
                languages += ` and  ${lang}`;
            } else languages += `, ${lang}`;
        });
        return languages;
    };

    const modelCategoryTabs = {
        VIRTUAL_AGENT: 0,
        ISSUE_AUTO_RESOLUTION: 1,
        SEARCH: 2
    };

    const ADD_A_LANGUAGE_MODAL = 'b2f0-6e2f-9989b8-3bee-a898cc8b';
    const DELETE_THIS_MODEL_MODAL = '6bae-2458-bbbb89-5550-9a98d29a';
    const ASSIGN_EDITORS_MODAL = 'c9ac-4c1b-9b98bb-fcc7-8a9a5ca8';
    const DELETE_WARNING_MODAL = '39dc-ab0b-8a99aa-3919-b89bbaa9';
    const SINGLE_CLONE_MODEL_MODAL = '56cf-a337-b98aab-cc89-8abb75a9';
    const GROUP_CLONE_MODEL_MODAL = 'c374-cdce-8998a9-c65e-8aa889bb';

    var currentTab = blockcontext.currentTab;
    switch (eventName) {

        case 'SET_DUPLICATE_MODEL_NAME':
            blockcontext.duplicateModelName = eventPayload.fieldValue;
            aceUtils.setContext(blockcontext);
            break;

        case 'SET_DUPLICATE_MODEL_DESCRIPTION':
            blockcontext.modelDescription = eventPayload.fieldValue;
            aceUtils.setContext(blockcontext);
            break;

        case 'SECONDARY_LANGUAGES_FOR_CLONE_SELECTED':
            blockcontext.selectedSecondaryLangsForCloning = eventPayload.value;
            aceUtils.setContext(blockcontext);
            break;  

        case 'PRIMARY_LANGUAGE_FOR_CLONE_SELECTED':
            const languagesOfSelectedModel = blockcontext.languagesOfSelectedModel;
            blockcontext.primaryLanguageOfCloneModel = eventPayload.value;
            blockcontext.primaryLanguageForCloningLabel = eventPayload.label
            if(blockcontext.actualPrimaryLanguageForCloning !== blockcontext.primaryLanguageOfCloneModel) {
                blockcontext.primaryLanguageChangedWarning = [{
                    "status": "warning",
                    "icon": "exclamation-triangle-outline",
                    "content": await helpers.translate("Any intents outside of the primary model will be dropped from the secondary model while copying.")
                    }];
            }
            else {
                blockcontext.primaryLanguageChangedWarning = [];
            }
            const languages = blockcontext.modelLanguages;
            blockcontext.primaryLanguagesForCloning = languages.filter((lang) => {
                return languagesOfSelectedModel.includes(lang.value);
            });
            blockcontext.selectedSecondaryLangsForCloning = languages.filter((lang) => {
                return lang.value !== blockcontext.primaryLanguageOfCloneModel && languagesOfSelectedModel.includes(lang.value);
            }); 
            aceUtils.setContext(blockcontext);
            break;
        
        case 'DUPLICATE_MODEL_CONFIRM':
            var errorsExist = false;
            const modelNameLength = blockcontext.duplicateModelName?.length;
            const shortDescriptionLength = blockcontext.modelDescription?.length;
            const isGroupClone = blockcontext.isGroupClone;

            // Validation for modelName
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

            // Validation for secondary languages for group clone
            if(isGroupClone) {
                const noOfSecondaryLanguages = blockcontext.selectedSecondaryLangsForCloning?.length
                if(noOfSecondaryLanguages === 0) {
                    errorsExist = true;
                    blockcontext.secondaryLangAlert = [{
                        "status": "critical",
                        "icon": "circle-exclamation-outline",
                        "content": await helpers.translate("This field cannot be empty")
                    }];
                }
                else {
                    blockcontext.secondaryLangAlert = [];
                }
            }

            if (errorsExist) {
                aceUtils.setContext(blockcontext);
                return;
            } else {
                errorsExist = false;
                aceUtils.setContext(blockcontext);
            }
            aceUtils.refreshContentBlock('clone_a_model').then((resp) => {
                aceUtils.getContext().then((bc) => {
                    var newBlockContext = bc;
                    var duplicateModelStatus = newBlockContext.duplicateModelResult;
                    if(isGroupClone) {
                        if(duplicateModelStatus.status === 'success') {
                            const selectedSecondaryLangsArray = newBlockContext.selectedSecondaryLangsForCloning.map(function(lang) {
                                return lang.label;
                            });
                            const languages = getLanguageNames(newBlockContext.primaryLanguageForCloningLabel, selectedSecondaryLangsArray);
                            const notifMessage = duplicateModelStatus.message + " in " + languages;
                            addNotification('group-clone-success', 'info', 'circle-info-outline', notifMessage);
                        }
                        else {
                            addNotification('group-clone-failure', 'critical', 'circle-close-fill', duplicateModelStatus.message);
                        }
                    }
                    else {
                        if(duplicateModelStatus.status === 'success') {
                            addNotification('single-clone-success', 'positive', 'circle-check-outline', duplicateModelStatus.message);
                            api.emit('NAV_ITEM_SELECTED', {
                                external: {
                                    url: `/$nlu-studio.do#/model-overview/${duplicateModelStatus.sysId}`,
                                    target:'_self'
                                }
                            });
                        }
                        else if(duplicateModelStatus.status === 'failure')
                            addNotification('single-clone-failure', 'critical', 'circle-close-fill', duplicateModelStatus.message);
                    } 
                    clearDuplicateModelVariables(newBlockContext);
                });
                
            });
            aceUtils.dismissModal();
            break;
            
        case 'DUPLICATE_THIS_MODEL_CLOSED':
            clearDuplicateModelVariables(blockcontext);
            aceUtils.dismissModal();
            break;

        case "NLU_TAB_CHANGED":
            const selectedTab = eventPayload.selectedTabIndex;
            var overlayDefinition = {
                type: 'loader',
                showColumnHeaders: true,
            };
            if(selectedTab === modelCategoryTabs.VIRTUAL_AGENT){
                blockcontext.currentTab = 'virtual_agent';
                blockcontext.modelLanguages = blockcontext.VALanguages;
                aceUtils.setContext(blockcontext);
                if (blockcontext.vaRowDefinition == null || Object.keys(blockcontext.vaRowDefinition).length == 0) {
                    if(blockcontext.isVaPluginInstalled === true){
                        blockcontext.overlayDefinition = overlayDefinition;
                        aceUtils.setContext(blockcontext);
                    }
                    aceUtils.refreshContentBlock('onModelFilterChange');
                }
            }
            else if (selectedTab === modelCategoryTabs.ISSUE_AUTO_RESOLUTION) {
                blockcontext.currentTab = 'issue_auto_resolution';
                blockcontext.modelLanguages = blockcontext.VALanguages;
                aceUtils.setContext(blockcontext);
                if (blockcontext.iarRowDefinition == null || Object.keys(blockcontext.iarRowDefinition).length == 0) {
                    if (blockcontext.enableIarEmptyTab === true) {
                        aceUtils.refreshContentBlock('iar_empty_state').then(() => {
                            aceUtils.getContext().then((bc) => {
                                var newBlockContext = bc;
                                if (newBlockContext.enableIarEmptyTab === false) {
                                    newBlockContext.overlayDefinition = overlayDefinition;
                                    aceUtils.setContext(newBlockContext);
                                    aceUtils.refreshContentBlock('onModelFilterChange');
                                }
                            });
                        });
                    } else {
                        blockcontext.overlayDefinition = overlayDefinition;
                        aceUtils.setContext(blockcontext);
                        aceUtils.refreshContentBlock('onModelFilterChange');
                    }
                }
            }
            else if(selectedTab === modelCategoryTabs.SEARCH){
                blockcontext.currentTab = 'search';
                blockcontext.modelLanguages = blockcontext.aiSearchLanguages;
                aceUtils.setContext(blockcontext);
                if(blockcontext.aisRowDefinition == null || Object.keys(blockcontext.aisRowDefinition).length == 0) {
                    blockcontext.overlayDefinition = overlayDefinition;
                    aceUtils.setContext(blockcontext);
                    aceUtils.refreshContentBlock('onModelFilterChange');
                }
            }
            break;

        case 'NLU_MODEL_RW':
            if (eventPayload.eventName === 'RECORD_WATCHER#MESSAGE_RECEIVED') {
                var overlayDefinition = {
                    type: 'loader',
                    showColumnHeaders: true,
                };
                var operation = eventPayload?.eventPayload?.data?.operation;
                switch (operation) {
                    case 'insert':
                    case 'delete':
                        blockcontext.overlayDefinition = overlayDefinition;
                        blockcontext.isInvokedFromRW = true;
                        aceUtils.setContext(blockcontext);
                        aceUtils.refreshContentBlock('onModelFilterChange');
                        break;
                    case 'update':
                        blockcontext.isInvokedFromRW = true;
                        aceUtils.setContext(blockcontext);
                        aceUtils.refreshContentBlock('onModelFilterChange');
                        break;
                }
            }
            break;

        case 'ADD_EDITORS_MODAL_CLOSED':
            blockcontext.editorsAlertMessage = [];
            aceUtils.setContext(blockcontext);
            aceUtils.dismissModal();
            break;

        case 'MODEL_LIST_ACTION_SELECTED':
            const action = eventPayload.actionItem.action;
            const { context } = eventPayload;
            var isGroupedAction = false;
            var selectedRows = [];
            if(context.row?.children) {
                isGroupedAction = true;
                blockcontext.modelNameForSelectedAction = context.row.modelDisplayName;
                selectedRows.push(...context.row.children);
            }
            else {
                blockcontext.modelNameForSelectedAction = context.rows[0].cells.model.modelDisplayName;
                selectedRows.push(...context.rows);
            }
            var modelSysIdForSelectedAction = selectedRows[0].key;
            var primaryLanguage = selectedRows[0].cells.language.label;
            switch(action) {
                case "ADD_LANGUAGE":
                    blockcontext.modelForTranslation = modelSysIdForSelectedAction;
                    blockcontext.primaryLanguageOfTranslationModel = primaryLanguage;
                    blockcontext.primaryLanguageOfTranslationModelValue = selectedRows[0].cells.language.value;
                    aceUtils.setContext(blockcontext);
                    aceUtils.refreshContentBlock('get_languages_to_add_in_model').then((res) => {
                        aceUtils.openModal(ADD_A_LANGUAGE_MODAL);
                    });
                    
                    break;
                case "EXPORT_MODEL_CSV":
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: `/sys_nlu_utterance_list.do?CSV&sysparm_view=export&sysparm_query=intent.model=${modelSysIdForSelectedAction}`,
                            target:'_self'
                        }
                    });
                    break;
                case "MANAGE_EDITORS":
                    blockcontext.disableAddEditorsButton = true;
                    blockcontext.disableAddEditorsButton = false;
                    blockcontext.modelLangauageOfSelectedRow = primaryLanguage;
                    blockcontext.addEditorsTitle = await helpers.translate('Add editors to the {0} model', blockcontext.modelNameForSelectedAction );
                    blockcontext.modelToAssignEditorsSysId = modelSysIdForSelectedAction;
                    aceUtils.setContext(blockcontext);
                    aceUtils.refreshContentBlock('get_nlu_editors');
                    aceUtils.openModal(ASSIGN_EDITORS_MODAL);
                    break;
                case "DUPLICATE_MODEL":
                    blockcontext.modelToDuplicateName = blockcontext.modelNameForSelectedAction;
                    blockcontext.modelToDuplicateSysId = modelSysIdForSelectedAction;
                    blockcontext.duplicateThisModelSubtitle = await helpers.translate('Add a name and description to make a copy of {0}', blockcontext.modelNameForSelectedAction);
                    aceUtils.setContext(blockcontext);
                    aceUtils.refreshContentBlock('get_duplicate_model_name').then((response) => {
                        aceUtils.getContext().then((bc) => {
                            var newBlockContext = bc;
                            if(isGroupedAction) {
                                newBlockContext.isGroupClone = true;
                                newBlockContext.primaryLanguageOfCloneModel = selectedRows[0].cells.language.value;
                                newBlockContext.primaryLanguageForCloningLabel = selectedRows[0].cells.language.label;
                                newBlockContext.actualPrimaryLanguageForCloning = newBlockContext.primaryLanguageOfCloneModel;
                                const languagesOfSelectedModel = selectedRows.map((row) => {
                                    return row.cells.language.value;
                                });
                                const languages = newBlockContext.modelLanguages;
                                newBlockContext.primaryLanguagesForCloning = languages.filter((lang) => {
                                    return languagesOfSelectedModel.includes(lang.value);
                                });
                                newBlockContext.secondaryLanguagesOfCloneModel = languages.filter((lang) => {
                                    return lang.value !== newBlockContext.primaryLanguageOfCloneModel && languagesOfSelectedModel.includes(lang.value);
                                });
                                newBlockContext.selectedSecondaryLangsForCloning = newBlockContext.secondaryLanguagesOfCloneModel;
                                newBlockContext.languagesOfSelectedModel = languagesOfSelectedModel;
                                aceUtils.setContext(newBlockContext);
                                aceUtils.openModal(GROUP_CLONE_MODEL_MODAL);
                            }
                            else {
                                newBlockContext.isGroupClone = false;
                                aceUtils.setContext(newBlockContext);
                                aceUtils.openModal(SINGLE_CLONE_MODEL_MODAL);
                            }
                        }); 
                    });
                    break;

                case "VIEW_LOCALIZATION_REQUEST":
                    var lfDetailsLink = selectedRows[0].cells.lfDetailsLink;
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: `/nav_to.do?uri=${encodeURIComponent(lfDetailsLink)}`,
                            target: '_blank'
                        }
                    });
                    break;

                case "DELETE_MODEL":
                    blockcontext.deleteThisModelTitle = await helpers.translate('The {0} model and its default test set will be permanently deleted.', blockcontext.modelNameForSelectedAction);
                    blockcontext.iUnderstandChecked = false;
                    blockcontext.disableNextButton = true;
                    blockcontext.modelToDeleteSysId = modelSysIdForSelectedAction;
                    aceUtils.setContext(blockcontext);
                    var noOfMappedIntentsOfSelectedModel = context.rows[0].cells.mappedIntents.value;
                    if(blockcontext.currentTab === 'virtual_agent' && noOfMappedIntentsOfSelectedModel !== 0){
                        aceUtils.refreshContentBlock('get_va_topic_mapped').then(() => {
                            aceUtils.openModal(DELETE_WARNING_MODAL);
                        });
                    }
                    else{
                        aceUtils.openModal(DELETE_THIS_MODEL_MODAL);
                    }
                    break;
            }
            break;

        case "I_UNDERSTAND_CHECKED":
            blockcontext.disableNextButton = eventPayload.value ? false : true;
            aceUtils.setContext(blockcontext);
            break;

        case "CLOSE_MODAL":
            aceUtils.dismissModal();
            break;

        case "EDITORS_SELECTED":
            var numberOfEditors = eventPayload.value?.length;
            blockcontext.disableAddEditorsButton = false;
            if(numberOfEditors > 4) {
                blockcontext.editorsAlertMessage = [{
                    "status": "critical",
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("Only 4 editors can be assigned to a model")
                }];
                aceUtils.setContext(blockcontext);
                return;
            }
            else {
                blockcontext.editorsAlertMessage = [];
            }
            blockcontext.selectedEditors = eventPayload.value;
            aceUtils.setContext(blockcontext);
            break;

        case "UPDATE_MODEL_EDITORS":
            aceUtils.refreshContentBlock('update_model_editors_list').then ((response) => {
                aceUtils.getContext().then((bc) => {
                    var newBlockcontext = bc;
                    newBlockcontext.editorsAlertMessage = [];
                    aceUtils.setContext(newBlockcontext);
                    aceUtils.dismissModal();
                    if(newBlockcontext.addEditorStatus) {
                        var numberOfEditors = newBlockcontext.selectedEditors?.length;
                        if(numberOfEditors > 1)
                            addNotification('editors-added', 'positive', 'circle-check-outline', `Model "${newBlockcontext.modelNameForSelectedAction}" assigned to editors`);
                        else if(numberOfEditors === 1)
                            addNotification('editors-added', 'positive', 'circle-check-outline', `Model "${newBlockcontext.modelNameForSelectedAction}" assigned to an editor`);
                        else if(numberOfEditors === 0)
                            addNotification('editors-added', 'positive', 'circle-check-outline', `Editors are no longer assigned to model "${newBlockcontext.modelNameForSelectedAction}"`);
                    }
                    else {
                        addNotification('editors-not-added', 'critical', 'circle-close-fill', `Model "${newBlockcontext.modelNameForSelectedAction}" could not be assigned to an editor at this moment, please try again later`);
                    }
                });

            });
            break;

        case 'ADDITIOINAL_LANGUAGE_SELECTED':
            blockcontext.languageForTranslation = item.value;
            blockcontext.languageForTranslationLabel = item.label;
            blockcontext.disableAddALanguage = false;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('get_translation_modes_for_language');
            break;

        case 'USE_AI_MODE_SELECTED':
            blockcontext.modeOfTranslation = 'machineTranslate';
            blockcontext.thirdPartyTranslateSelected = false;
            blockcontext.machineTranslateSelected = true;
            blockcontext.noTraslationSelected = false
            aceUtils.setContext(blockcontext);
            break;

        case 'USE_THIRD_PARTY_MODE_SELECTED':
            blockcontext.modeOfTranslation = 'thirdPartyTranslate';
            blockcontext.thirdPartyTranslateSelected = true;
            blockcontext.machineTranslateSelected = false;
            blockcontext.noTraslationSelected = false
            aceUtils.setContext(blockcontext);
            break;

        case 'NO_TRANSLATION_MODE_SELECTED':
            blockcontext.modeOfTranslation = 'manual';
            blockcontext.thirdPartyTranslateSelected = false;
            blockcontext.machineTranslateSelected = false;
            blockcontext.noTraslationSelected = true
            aceUtils.setContext(blockcontext);
            break;

        case 'ADD_TRANSLATION_TO_MODEL':
            blockcontext.disableAddALanguage = true;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('add_translation_to_model').then(() => {
                aceUtils.getContext().then((response) => {
                    var newBlockContext = response;
                    const { sysId, status, message } = newBlockContext.modelTranslationStatus;
                    if(status === 'failure') {
                        addNotification('translation-failure-alert', 'error', 'circle-info-outline', message);
                    }
                    else {
                        if(newBlockContext.modeOfTranslation === 'manual'){
                            api.emit('NAV_ITEM_SELECTED', {
                                external: {
                                    url: `/$nlu-studio.do#/model/${sysId}`,
                                    target:'_self'
                                }
                            });
                        }
                        else {
                            var notificationMessage = "<span><b>Language added</b>. Translating " + newBlockContext.modelNameForSelectedAction + " to "+ newBlockContext.languageForTranslationLabel + "</span>";
                            addNotification('translation-alert', 'info', 'circle-info-outline', notificationMessage);
                        }
                    }
                });
                clearTranslationVariables();
                aceUtils.dismissModal();
            });
            break;
        case 'DELETE_MODEL_CONFIRM':
            const deleteMsg = await helpers.translate('Your model has been deleted')
            aceUtils.refreshContentBlock('delete_this_model_action').then(() => {
                addNotification('model-deleted', 'positive', 'circle-check-outline', deleteMsg);
            });
            aceUtils.dismissModal();
            blockcontext.disableNextButton = true;
            aceUtils.setContext(blockcontext)
            break;

        case 'CLOSE_ADD_A_LANGUAGE_MODAL':
            clearTranslationVariables();
            aceUtils.dismissModal();
            break;

        case 'MODEL_SEARCH_FILTER':
            if (currentTab === 'virtual_agent')
                blockcontext.vaSearchText = eventPayload.fieldValue;
            else if (currentTab === 'issue_auto_resolution')
                blockcontext.iarSearchText = eventPayload.fieldValue;
            else if (currentTab === 'search')
                blockcontext.aisSearchText = eventPayload.fieldValue;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('onModelFilterChange');
            break;

        case 'MODEL_SHOW_OOB_FILTER':
            var toggleValue = eventPayload.value;
            switch (currentTab) {
                case 'virtual_agent':
                    blockcontext.vaIsOOB = toggleValue;
                    break;
                case 'issue_auto_resolution':
                    blockcontext.iarIsOOB = toggleValue;
                    break;
                case 'search':
                    blockcontext.aisIsOOB = toggleValue;
                    break;
            }
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('onModelFilterChange');
            break;

        case 'MODEL_LANGUAGE_FILTER':
            var languageValue = eventPayload.value;
            switch (currentTab) {
                case 'virtual_agent':
                    blockcontext.vaLanguageFilter = languageValue;
                    break;
                case 'search':
                    blockcontext.aisLanguageFilter = languageValue;
                    break;
            }
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('onModelFilterChange');
            break;
            
        case 'PAGE_CHANGE':
            var overlayDefinition = {
                type: 'loader',
                showColumnHeaders: true,
            };

            if (currentTab === 'virtual_agent' && blockcontext.vaPageNumber !== eventPayload.value) {
                blockcontext.vaPageNumber = eventPayload.value;
                blockcontext.overlayDefinition = overlayDefinition;
                aceUtils.setContext(blockcontext);
                aceUtils.refreshContentBlock('onModelFilterChange');
            } else if (currentTab === 'issue_auto_resolution' && blockcontext.iarPageNumber !== eventPayload.value) {
                blockcontext.iarPageNumber = eventPayload.value;
                blockcontext.overlayDefinition = overlayDefinition;
                aceUtils.setContext(blockcontext);
                aceUtils.refreshContentBlock('onModelFilterChange');
            } else if (currentTab === 'search' && blockcontext.aisPageNumber !== eventPayload.value) {
                blockcontext.aisPageNumber = eventPayload.value;
                blockcontext.overlayDefinition = overlayDefinition;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('onModelFilterChange');
            }

            break;
    }
}
