answer = JSON.stringify(conversationCount());

function conversationCount() {
    var result = {};
    if (!GlideTableDescriptor.isValid('sys_cs_conversation')) {
      return result;
    }
    var ga = new GlideAggregate('sys_cs_conversation');
    ga.addAggregate('COUNT', 'state');
    ga.query();

    var count = 0;
    var stateCount = 0;
    while (ga.next()) {
      stateCount = parseInt(ga.getAggregate('COUNT', 'state'));
      result[ga.state] = stateCount;
      count += stateCount;
    }
    result.count = count;
    return result;
}
