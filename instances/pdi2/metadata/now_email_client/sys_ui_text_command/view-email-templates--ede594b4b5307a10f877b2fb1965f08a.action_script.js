function getEmailTemplatesForPicker(recordTable, recordSysId, query) {
    var answer;
    var items = [];

    function isAttrTrue(val) {
        return val === true || val === 'true';
    }

    function getRecommendationsFlagFromVariableSetProps(varSetProps) {
	return isAttrTrue(varSetProps?.show_template_suggestions ?? false);
    }

    function mapGenAiEmailTemplates(genAiTemplates) {
        return genAiTemplates.map(function(template) {
            function getCol(field) {
                var col = (template.columns || []).find(function(c) { return c.fieldName === field; });
                return col ? col.displayValue : "";
            }
            var payload = {
                sys_id: getCol("sys_id") || template.sys_id,
                body: getCol("body_html") || getCol("body") || "",
                subject: getCol("subject") || "",
                to: "", cc: "", bcc: "" // GenAI doesn't return these, but keep fields for consistency
            };
            return {
                id: getCol("sys_id") || template.sys_id,
                title: getCol("subject") || getCol("name") || template.title || "",
                displayContent: getCol("body_html") || getCol("body") || "",
                replaceContent: getCol("body_html") || getCol("body") || "",
                actionPayload: JSON.stringify(payload),
                name: getCol("subject") || getCol("name") || template.title || "",
                actionType: "replace_content",
                isRecommended: true
            };
        });
    }

    if (!query || query.trim() === "") {
        var grCheck = new GlideRecord('sys_email_client_template');
        grCheck.addQuery('table', recordTable);
        grCheck.query();
        if (!grCheck.hasNext()) {
            answer = {
                message: gs.getMessage('No email templates configured')
            };
            return answer;
        }

        // Use Script Include directly for GenAI recommendations
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
	var emailClientVarSetProps = new sn_uxc_gen_ai.UXCGenAIEmailReplyUtils().getEmailSkillConfigProps(emailDraftId);
	var recommendationsFlag = getRecommendationsFlagFromVariableSetProps(emailClientVarSetProps);
	if(recommendationsFlag) {
            try {
                var facetFilters = [{ record_table: 'sys_email_client_template', record_sys_ids: [] }];
                var aiSearchQuery = "";
                var genAiCore = new sn_uxc_gen_ai.UXCGenAITemplateCore();
         	var result = genAiCore._getRecommendedTemplatesRaw(recordTable, recordSysId, facetFilters, aiSearchQuery);

            	if (result && result.search_result && result.search_result.sys_email_client_template) {
                	items = mapGenAiEmailTemplates(result.search_result.sys_email_client_template);
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
        // If no GenAI recommendations, show the "Enter a keyword..." message
        if (!gotRecommendations) {
            answer = {
                message: gs.getMessage('Enter a keyword to search for the relevant template')
            };
        }
    } else {
        // Classic search for non-empty queries
        var gr = new GlideRecord('sys_email_client_template');
        gr.addQuery('table', recordTable); // Filter by table
        var qc = gr.addQuery('subject', 'CONTAINS', query);
        qc.addOrCondition('body', 'CONTAINS', query);
        qc.addOrCondition('body_html', 'CONTAINS', query);
        gr.orderByDesc('sys_updated_on');
        gr.query();

        // Fetch the target record for condition evaluation
        var targetRecord = new GlideRecord(recordTable);
        var recordFound = targetRecord.get(recordSysId);

        while (gr.next()) {
            var templateCondition = gr.getValue('condition');
            var includeTemplate = false;

            if (!templateCondition) {
                // No condition: always show if table matches
                includeTemplate = true;
            } else if (recordFound) {
                // Condition exists: check if record matches the encoded query
                var rec = new GlideRecord(recordTable);
                rec.addEncodedQuery(templateCondition);
                rec.addQuery('sys_id', recordSysId);
                rec.query();
                if (rec.next()) {
                    includeTemplate = true;
                }
            }

            if (includeTemplate) {
                var payload = {
                    sys_id: gr.getValue('sys_id'),
                    body: gr.getValue('body_html') || gr.getValue('body'),
                    subject: gr.getValue('subject'),
                    to: gr.getValue('recipients'),
                    cc: gr.getValue('copied'),
                    bcc: gr.getValue('blind_copied')
                };
                items.push({
                    id: gr.getValue('sys_id'),
                    title: gr.getValue('subject') || gr.getValue('name'),
                    displayContent: gr.getValue('body_html') || gr.getValue('body'),
                    replaceContent: gr.getValue('body_html') || gr.getValue('body'),
                    actionPayload: JSON.stringify(payload),
                    name: gr.getValue('subject') || gr.getValue('name'),
                    actionType: "replace_content"
                });
            }
        }
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

answer = getEmailTemplatesForPicker(recordTable, recordSysId, query);
