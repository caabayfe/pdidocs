var ruleSysID = action.getGlideURI().get('sysparm_collectionID');

var redirectUri = 'ais_rule_action.do?sys_id=-1&sysparm_query=rule=' + ruleSysID + "^type=" + "BOOST";

var ruleActionGR = new GlideRecord('ais_rule_action');
ruleActionGR.addQuery('rule', ruleSysID);
ruleActionGR.orderByDesc('order');
ruleActionGR.query();
var newOrder = 100;
if (ruleActionGR.next()) {
    newOrder += parseInt(ruleActionGR.order);
    redirectUri = redirectUri + '^type=' + ruleActionGR.type;
}
redirectUri = redirectUri + '^order=' + newOrder;

/* Go to the form to create a new Improvement Rule Result */
action.setRedirectURL(redirectUri);

/* Return to this rule form when done */
var ruleGR = new GlideRecord('ais_rule');
ruleGR.get(ruleSysID);
action.setReturnURL(ruleGR);
