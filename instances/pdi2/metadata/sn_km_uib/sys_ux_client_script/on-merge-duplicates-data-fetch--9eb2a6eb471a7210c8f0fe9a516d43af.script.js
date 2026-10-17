/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    // Return silently if the parameters don't satisfy
    if (api.context.props.sysId != '-1' || (!api.state.isGeneratingMergeDuplicates && !api.state.mergeDuplicatesTimeoutId)) {
        return;
    }
    // When data fetch succeeds
    if (event.name === "DATA_FETCH_SUCCEEDED") {
        // Check if already timed out
        if (api.state.isMergeDuplicatesTimedOut) {
            return;
        }

        // Clear timeout and state
        api.setState('isGeneratingMergeDuplicates', false);
        helpers.timing.clearTimeout(api.state.mergeDuplicatesTimeoutId);
        api.setState('mergeDuplicatesTimeoutId', null);


        var output = api.data.merge_duplicates_articles_with_gen_ai_tinymce_1.output;
        // Parse the output
        if (output && output.success) {
            var response = output.content;
            if (response) {
                try {
                    var capabilities = response.capabilities;
                    if (!capabilities || Object.keys(capabilities).length === 0) {
                        throw new Error('No capabilities found');
                    }

                    var capabilityKey = Object.keys(capabilities)[0];
                    var capability = capabilities[capabilityKey];

                    if (capability && capability.status === 'success') {
                        var parsedResponse = JSON.parse(capability.response);
                        var modelOutput = parsedResponse.model_output;

                        var modelData;
                        try {
                            modelData = JSON.parse(modelOutput);
                        } catch (e) {
                            // Fallback for truncated JSON
                            var titleMatch = modelOutput.match(/"Title"\s*:\s*"([^"]*)"/);
                            var marker = '"Combined Article": "';
                            var idx = modelOutput.indexOf(marker);
                            modelData = {
                                'Title': titleMatch ? titleMatch[1] : '',
                                'Combined Article': idx !== -1 ? modelOutput.slice(idx + marker.length) : ''
                            };
                        }

                        if (modelData['Title']) {
                            helpers.timing.setTimeout(function() {
                                api.emit('GEN_AI_SET_FIELD', {
                                    fieldName: 'short_description',
                                    value: modelData['Title']
                                });
                            }, 3000);
                        }

                        if (modelData['Combined Article']) {
                            helpers.timing.setTimeout(function() {
                                 api.emit('GEN_AI_SET_FIELD', {
                                        fieldName: 'text',
                                        value: modelData['Combined Article']
                                 });
                            }, 3000);
                        }

                        api.setState('isGenAiGenerated', true);
                        await updateUIMessage(output, helpers, api);
                    } else {
                        throw new Error('Capability failed');
                    }
                } catch (e) {
                    console.error('Error parsing merge duplicates response:', e);
                    await showErrorNotification(helpers, api);
                }
            } else {
                await showErrorNotification(helpers, api);
            }
        } else {
            await showErrorNotification(helpers, api);
        }

    } else if (event.name === "DATA_FETCH_FAILED") {
        if (api.state.isMergeDuplicatesTimedOut) {
            return;
        }

        api.setState('isGeneratingMergeDuplicates', false);
        helpers.timing.clearTimeout(api.state.mergeDuplicatesTimeoutId);
        api.setState('mergeDuplicatesTimeoutId', null);  // CLEAR IT

        await showErrorNotification(helpers, api);
    }

    async function updateUIMessage(output, helpers, api) {
        var duplicateArticlesNumbersText = '';
        var hasDuplicateArticlesNumbers = output && output.numbers && output.numbers.length > 1;

        if (hasDuplicateArticlesNumbers) {
            var numbersCount = output.numbers.length;
            if (numbersCount === 2) {
                duplicateArticlesNumbersText = String(output.numbers[0]) + " and " + String(output.numbers[1]);
            } else {
                for (var index = 0; index < numbersCount; index++) {
                    var currentNumberText = String(output.numbers[index]);
                    if (index === 0) duplicateArticlesNumbersText = currentNumberText;
                    else if (index === numbersCount - 1) duplicateArticlesNumbersText = await helpers.translate("{0}, and {1}", duplicateArticlesNumbersText, currentNumberText);
                    else duplicateArticlesNumbersText =  await helpers.translate("{0}, {1}",duplicateArticlesNumbersText, currentNumberText);
                }
            }
        }

        var textToDisplay = hasDuplicateArticlesNumbers
            ? await helpers.translate("<div><strong>This article is drafted by AI. Check for accuracy before saving.</strong> This article merges content from {0}. View the source articles in the <strong>Source articles</strong> related tab.</div>", duplicateArticlesNumbersText)
            : await helpers.translate("<div><strong>This article is drafted by AI. Check for accuracy before saving.</strong> View the source articles in the <strong>Source articles</strong> related tab.</div>");

        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_drafted",
                status: "ai",
                icon: "sn-sparkmoji-logo-outline",
                content: {type: "html", value: textToDisplay},
                action: { type: "dismiss" }
            }]
        });
    }

    async function showErrorNotification(helpers, api) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_error",
                status: "critical",
                icon: "sn-sparkmoji-logo-outline",
                content: await helpers.translate("There was a problem merging articles with AI. You can write it yourself now if you'd like."),
                action: { type: "dismiss" }
            }]
        });
    }
}
