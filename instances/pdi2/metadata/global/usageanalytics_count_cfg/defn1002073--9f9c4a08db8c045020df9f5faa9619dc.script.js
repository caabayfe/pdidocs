var count = 0;
var model, ga, query;
var gRec = new GlideRecord("sys_nlu_model_status");
gRec.addQuery('published_version', '>=' , '1');
gRec.query();
while (gRec.next()) {
	model = gRec.getValue('model');
    query = 'intent.model.sys_id='+model;
    ga = new GlideAggregate('sys_nlu_utterance');
    ga.addAggregate('COUNT');
    ga.addEncodedQuery(query);
    ga.query();
    if (ga.next()) {
        count += parseInt(ga.getAggregate('COUNT'));
    }
}
answer = count;
