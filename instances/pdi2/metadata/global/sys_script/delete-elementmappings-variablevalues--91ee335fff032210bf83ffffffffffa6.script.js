(function executeRule(current, previous /*null when async*/) {
var contextService = new PDProcessContextService();
contextService.deleteElementMappingsAndVariableValues([current.getUniqueValue()]);
})(current, previous);
