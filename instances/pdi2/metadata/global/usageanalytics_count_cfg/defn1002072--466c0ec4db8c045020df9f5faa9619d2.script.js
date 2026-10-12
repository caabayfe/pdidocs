var count = 0;
var model, ga;
var gRec = new GlideRecord("sys_nlu_model_status");
gRec.addQuery('published_version', '>=' , '1');
gRec.query();
while (gRec.next()) {
	model = gRec.getValue('model');
    ga = new GlideAggregate('sys_nlu_vocabulary');
    ga.addAggregate('COUNT');
    ga.addQuery('model', model);
    ga.query();
    if (ga.next()) {
        count += parseInt(ga.getAggregate('COUNT'));
    }
}
answer = count;
