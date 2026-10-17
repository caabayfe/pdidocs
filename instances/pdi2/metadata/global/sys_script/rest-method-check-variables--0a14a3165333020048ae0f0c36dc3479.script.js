gs.include('RESTVariableBusinessRuleChecker');
var checker = new RESTVariableBusinessRuleChecker();
var grRestMessage = new GlideRecord('sys_rest_message');
grRestMessage.get(current.rest_message);
grRestMessage.next();

checker.check(grRestMessage, current.function_name);
