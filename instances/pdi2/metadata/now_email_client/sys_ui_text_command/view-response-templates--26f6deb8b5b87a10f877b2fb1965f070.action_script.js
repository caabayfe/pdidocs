function getResponseTemplates(recordTable, recordSysId, query) {
    var answer;

    function isAttrTrue(val) {
	return val === true || val === 'true';
    }

    function getRecommendationsFlagFromVariableSetProps(varSetProps) {
	return isAttrTrue(varSetProps?.show_template_suggestions ?? false);
    }

    if (!query || query.trim() === "" || query.trim() === "r") {
        var templateChecker = new sn_templated_snippets.ResponseTemplate();
        templateChecker.setChannel('email');
        var rawCheck = templateChecker.query(recordTable, recordSysId, "", 1, 0, false, "");
        var checkResult = JSON.parse(rawCheck);
        if (!checkResult.length) {
            answer = {
                message: gs.getMessage('No response templates configured')
            };
            return answer;
        }

        var gotRecommendations = false;

	var draft = new GlideRecord('sys_email_draft');
	var emailDraftId = '';
	draft.addQuery('target_table', recordTable);  
	draft.addQuery('target_record', recordSysId);
	draft.orderByDesc('sys_updated_on');
	draft.query();
	if (draft.next()) {
	    emailDraftId = draft.getValue('sys_id');
	} else {
	    gs.info("No draft found");
	}
	var emailClientVarSetProps = {};
	try {
	    emailClientVarSetProps = new sn_uxc_gen_ai.UXCGenAIEmailReplyUtils().getEmailSkillConfigProps(emailDraftId);
	} catch (e) {
	    gs.info('sn_uxc_gen_ai not available: ' + e);
	}
	var recommendationsFlag = getRecommendationsFlagFromVariableSetProps(emailClientVarSetProps);
	if(recommendationsFlag) {
            try {
                var facetFilters = [{ record_table: 'sn_templated_snip_note_template', record_sys_ids: [] }];
                var aiSearchQuery = "";
                var genAiCore = new sn_uxc_gen_ai.UXCGenAITemplateCore();
                var result = genAiCore._getRecommendedTemplatesRaw(recordTable, recordSysId, facetFilters, aiSearchQuery);

                var items = [];
                if (result && result.search_result && result.search_result.sn_templated_snip_note_template) {
                    items = result.search_result.sn_templated_snip_note_template.map(function(template) {
                        var obj = {};
                        (template.columns || []).forEach(function(col) {
                            obj[col.fieldName] = col.displayValue;
                        });
                        return {
                            id: obj.sys_id || template.sys_id,
                            displayContent: obj.html_script_body || obj.body_html || obj.body || obj.name || template.title || "",
                            title: obj.name || template.title || "",
                            insertContent: obj.html_script_body || obj.body_html || obj.body || obj.name || template.title || "",
                            isRecommended: true
                        };
                    });
                }
                if (items.length) {
                    answer = {
                        items: items,
                        header: gs.getMessage('Templates found by AI')
                    };
                    gotRecommendations = true;
                }
            } catch (e) {
                gs.error('GenAI fetch error: ' + e);
                gotRecommendations = false;
            }
        }

        if (!gotRecommendations) {
            answer = {
                message: gs.getMessage('Enter a keyword to search for the relevant template')
            };
        }
    } else {
        // Classic search for non-empty queries
        var template = new sn_templated_snippets.ResponseTemplate();
        var limit = gs.getProperty('com.glide.quickactions.maxresults.templates', 9);
        var offset = 0;
        var includeEvaluatedBody = true;
        var errorFormat = "";
        var chatResponseTemplateChannel = 'email';
        template.setChannel(chatResponseTemplateChannel);

        var raw = template.query(recordTable, recordSysId, query, limit, offset, includeEvaluatedBody, errorFormat);
        var queryResult = JSON.parse(raw);
        var items = queryResult.filter(function(result) {
            return result.evaluated_response.success;
        }).map(function(result) {
            return {
                id: result.sys_id,
                displayContent: result.evaluated_response.evaluated_body,
                title: result.name,
                insertContent: result.evaluated_response.evaluated_body,
            };
        });
        if (!items.length) {
            answer = {
                templateMessage: {
                    illustration: "no-search-results",
                    headingLabel: gs.getMessage('Template not found'),
                    content: gs.getMessage('Try searching with another keyword')
                }
            };
        } else {
            answer = { items: items };
        }
    }
    return answer;
}

answer = getResponseTemplates(recordTable, recordSysId, query);
