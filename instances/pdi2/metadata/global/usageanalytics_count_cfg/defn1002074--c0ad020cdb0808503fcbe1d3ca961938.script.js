var count = 0;
var model, ga;
var gRec = new GlideRecord("sys_nlu_model_status");
gRec.addQuery('published_version', '>=' , '1');
gRec.query();
while (gRec.next()) {
	//Model level entities
    model = gRec.getValue('model');
    ga = new GlideAggregate('sys_nlu_entity');
    ga.addAggregate('COUNT');
    ga.addQuery('model', model);
	
    ga.query();
    if (ga.next()) {
        count += parseInt(ga.getAggregate('COUNT'));
    }
	//intent level entities
    var query = 'entity.modelISEMPTY^intent.model.sys_id='+model;
    ga = new GlideAggregate('m2m_sys_nlu_intent_entity');
    ga.addAggregate('COUNT');
    ga.addEncodedQuery(query);
    ga.query();
    if (ga.next()) {
        count += parseInt(ga.getAggregate('COUNT'));
    }
}
answer = count;
