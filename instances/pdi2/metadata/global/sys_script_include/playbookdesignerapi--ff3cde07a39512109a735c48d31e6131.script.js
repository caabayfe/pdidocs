var PlaybookDesignerAPI = Class.create();
PlaybookDesignerAPI.prototype = {
    initialize: function() {},

    type: 'PlaybookDesignerAPI'
};

// Checks if the instance and current user meet the requirements to use Now Assist to generate a playbook
PlaybookDesignerAPI.canGeneratePlaybook = function() {
    return PDUtils.isPlaybookGenerationEnabledForUser(true);
};

// Checks if the current user has permissions to create a plabyook
PlaybookDesignerAPI.canCreatePlaybook = function() {
    const padUtilsSi = new PADUtilsSI();
    return padUtilsSi.userHasCreateProcessDefAccess();
};

/**
 * Generates a playbook based on the provided prompt and additional information.
 * @param {Object} params - The parameters object.
 * @param {String} params.prompt - The prompt to generate the playbook from. Required. Max length defined in /sys_dictionary.do?sys_id=011eaa825d461210b2c49e98e2bdb841 (accessible through the sys_pd_process_definition dictionary -- property is now_assist_prompt)
 * @param {Object} params.additionalPlaybookInfo - The additional information to generate the playbook. Required.
 * @param {String} params.additionalPlaybookInfo.label - The label of the playbook. Required.
 * @param {String} params.additionalPlaybookInfo.sysScope - The sys_id of the scope of the playbook. Required.
 * @param {String} params.meta - The meta information to pass to the callbackHandler. Optional.
 * @param {Function} params.callbackHandler - The callback handler to call after the playbook is generated. Optional.
 * @param {String} params.requestId - The request ID to use for the playbook generation. Optional.
 * @returns {Object} - The object containing the URL of the generated playbook, the meta information, and the request ID.
 * @throws {Error} - If the user is not authorized to generate a playbook.
 * @throws {Error} - If the prompt, label or sysScope is not provided.
 *
 * @example
 * var params = {
 *      prompt: 'Create a new incident',
 *      additionalPlaybookInfo: {
 *      label: 'Incident Playbook',
 *      sysScope: 'e0e8b7c0c0a8010e00f6f8b4f2b477e1'
 *      },
 *      meta: {
 *        foo: 'bar'
 *      },
 *      callbackHandler: "scope.PlaybookDesignerAPICallbackHandler",
 *      requestId: '1234'
 *    };
 *
 *  var { url, meta, requestId } = PlaybookDesignerAPI.generatePlaybook(params);
 *
 */
PlaybookDesignerAPI.generatePlaybook = function(params = {}) {
    const {
        prompt,
        additionalPlaybookInfo,
        meta,
        callbackHandler,
        requestId
    } = params;

    if (!PlaybookDesignerAPI.canGeneratePlaybook()) {
        throw Error(PADConstants.Errors.Messages.UNAUTHORIZED);
    }

    if (!prompt) {
        throw Error(gs.getMessage('Please provide a prompt'));
    }

    const pdNowAssistUtils = new PDNowAssistUtils();

    const {
        playbookDefinitionId,
        requestId: finalRequestId
    } = pdNowAssistUtils.generateProcessFromAPI({
        prompt,
        additionalPlaybookInfo,
        requestId,
        meta,
        callbackHandler
    });

    var urlParams = playbookDefinitionId ? {} : {
        generationRequestId: finalRequestId
    };

    const url = PDUtils.getWorkflowStudioURL(playbookDefinitionId, urlParams);

    return {
        url: url,
        meta: meta,
        requestId: finalRequestId
    };
};
