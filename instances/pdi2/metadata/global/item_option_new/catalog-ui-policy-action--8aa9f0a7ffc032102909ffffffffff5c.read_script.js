answer = (function() {
    var uiPolicy = current.sys_id;
    var uiPolicyActions = [];
    var aiInferredActions = {};
    if (uiPolicy) {
        var uiPolicyActionGR = new GlideRecord('catalog_ui_policy_action');
        uiPolicyActionGR.addQuery('ui_policy', uiPolicy);
        uiPolicyActionGR.orderBy('order');
        uiPolicyActionGR.query();
        while (uiPolicyActionGR.next()) {
            var action = {
                'sys_id': uiPolicyActionGR.sys_id + '',
                'variable': uiPolicyActionGR.variable + '',
                'catalog_variable': uiPolicyActionGR.catalog_variable + '',
                'order': uiPolicyActionGR.order + '',
                'mandatory': uiPolicyActionGR.mandatory + '',
                'visible': uiPolicyActionGR.visible + '',
                'disabled': uiPolicyActionGR.disabled + '',
                'field_message_type': uiPolicyActionGR.field_message_type + '',
                'field_message': uiPolicyActionGR.field_message + '',
                'value_action': uiPolicyActionGR.value_action + '',
                'value': uiPolicyActionGR.value + '',
                'cleared': uiPolicyActionGR.cleared + ''
            };
            uiPolicyActions.push(action);
        }
    }

    function getNowAssistQuestionValue() {
        var _questionId = question.getUniqueValue();
        var _questionAnswerRecord = new GlideRecord("question_answer");
        _questionAnswerRecord.addQuery("question", _questionId);
        _questionAnswerRecord.addQuery("table_sys_id", current.getUniqueValue());
        _questionAnswerRecord.query();
        if (_questionAnswerRecord.next())
            return _questionAnswerRecord.getValue("value") || '{}';
        return '{}';
    }
    try {
        var assistedValueStr = getNowAssistQuestionValue();
        var assistedValue = JSON.parse(assistedValueStr);
        aiInferredActions = assistedValue.aiInferredActions || {};
    } catch(e) {
        aiInferredActions = {};
    }
    var actionData = {
        actions: uiPolicyActions,
        aiInferredActions: aiInferredActions
    };
    return JSON.stringify(actionData);


})();
