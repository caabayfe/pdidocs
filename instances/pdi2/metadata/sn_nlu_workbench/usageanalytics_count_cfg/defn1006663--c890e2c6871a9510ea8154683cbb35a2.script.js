var result = 0;
var glideGr = new GlideAggregate('open_nlu_predict_intent_feedback');
var encodedQuery = 'predictionISEMPTY^sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()^nlu_provider=64c023c17300330021a044764df6a70e';

try {
    glideGr.addAggregate('COUNT', 'audit_log');
    glideGr.addEncodedQuery(encodedQuery);
    glideGr.query();
    if (glideGr.next()) {
        result = glideGr.getRowCount();
    }
} catch (e) {
    result = 0;
}
answer = parseInt(result);
