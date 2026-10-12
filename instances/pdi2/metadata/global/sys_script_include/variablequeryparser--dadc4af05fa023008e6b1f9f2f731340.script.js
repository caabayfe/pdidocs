var VariableQueryParser = Class.create();
VariableQueryParser.prototype = Object.extendsObject(QueryParseAjax, {
    process: function() {
        QueryParseAjax.prototype.process.call(this);
        function getRecordFromRecordCache(tableName, id) {
            var gr = GlideRecordCache.get(tableName, id);
            if (!gr || !gr.isValidRecord()) {
                gr = new GlideRecord(tableName);
                if (!gr.get(id))
                    return null;
                GlideRecordCache.put(gr);
            }
            return gr;
        }
        var elements = this.getRootElement().childNodes;
        for (var i = 0; i < elements.length; i++) {
            var field = elements.item(i).getAttribute("field");
            var value = elements.item(i).getAttribute("value");
            var question;
            if (field)
                question = GlideappQuestion.getQuestion(field.substring(3));
                
            // We donot check read permission on a question inside the MRVS
            if (question) {
                var setId = question.getVSetID();
                if (GlideStringUtil.isEligibleSysID(setId) && question.getVSetType() == 'one_to_many') {
                    var setGr = getRecordFromRecordCache('item_option_new_set', setId);
                    if (setGr == null || !gs.hasRole(setGr.read_roles.toString()))
                        return;
                } else {
                    if (!gs.hasRole(question.getReadRoles()))
                        return;
                }
            }
            if (field && value.startsWith("javascript:")) {
                var sBoxEvalObj = new GlideScriptEvaluator();
                sBoxEvalObj.setEnforceSecurity(true);
                value = sBoxEvalObj.evaluateString(value, false);
                if (question.getType() == 9 || question.getType() == 10) {
                    question.setDisplayValue(value);
                    value = question.getDisplayValue();
                }
                else {
                    question.setValue(value);
                    value = question.getValue();
                }
                elements.item(i).setAttribute("value", value);
            } else
                elements.item(i).setAttribute("value", value.replace('^^', '^'));
                //  Query separator(^) is escaped via StringUtil::escapeQueryTermSeparator
            if (question && question.getType() == 21 && value) {
                question.setValue(elements.item(i).getAttribute("value"));
                elements.item(i).setAttribute("value", question.getValue());
                elements.item(i).setAttribute("display_value", question.getDisplayValue());
            }
        }
    },
    type: "VariableQueryParser"
});
