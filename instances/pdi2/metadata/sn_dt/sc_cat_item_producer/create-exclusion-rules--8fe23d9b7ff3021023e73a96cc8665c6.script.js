current.setAbortAction(true);
producer.redirect = 'sn_dt_exclusion_rule_list.do';

var exactMatchesObj = JSON.parse(producer.exact_matches);
var gr = new GlideRecord("sn_dt_exclusion_rule");
for (var i = 0; i < exactMatchesObj.length; i++) {
    var exactMatch = exactMatchesObj[i];
    gr.initialize();
    gr.setValue("rule_type", "exact_match");
    gr.setValue("name", exactMatch.exact_match_name);
    gr.setValue("exclusion_term", exactMatch.exact_match_exclusion_term);
    if (exactMatch.exact_match_order)
        gr.setValue("order", exactMatch.exact_match_order);
    gr.insert();
}

var patternMatchesObj = JSON.parse(producer.pattern_matches);
for (var j = 0; j < patternMatchesObj.length; j++) {
    var patternMatch = patternMatchesObj[j];
    gr.initialize();
    gr.setValue("rule_type", "pattern_match");
    gr.setValue("name", patternMatch.pattern_match_name);
    gr.setValue("exclusion_term", patternMatch.pattern_exclusion_term);
    if (patternMatch.pattern_match_description)
        gr.setValue("description", patternMatch.pattern_match_description);
    if (patternMatch.pattern_match_order)
        gr.setValue("order", patternMatch.pattern_match_order);
    gr.insert();
}
