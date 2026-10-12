var count = 0;
var gRec = new GlideRecord("sys_nlu_intent");
var joinQuery = gRec.addJoinQuery('sys_nlu_model_status', 'model', 'model');
joinQuery.addCondition("published_version", '>', '0');
gRec.query();
while (gRec.next()) {
    count++;
}
answer = count;
