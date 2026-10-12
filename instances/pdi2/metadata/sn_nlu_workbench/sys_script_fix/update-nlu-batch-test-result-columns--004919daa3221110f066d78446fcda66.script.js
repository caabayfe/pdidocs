var testResultGr = new GlideRecord("nlu_batch_test_result");
testResultGr.query();
while (testResultGr.next()) {
  testResultGr.setValue("test_utterance", testResultGr.utterance.utterance);
  testResultGr.setValue("expected_intent", testResultGr.utterance.intent);
  testResultGr.update();
}
