(function executeRule(current, previous /*null when async*/) {	
  var testId = current.getValue('test');
  var atfTest = new GlideRecord("sys_atf_test");

  // dont re-order steps before a mass delete triggered by the parent sys_atf_test being deleted
  if (atfTest.get(testId)) {
    new ATFOrderUpdate().reorderAfterRemove('sys_atf_step', current);
  }
})(current, previous);
