var session = gs.getSession();
var previous = session.setWorkflow(true);

var tableName = 'sys_kafka_consumer_statistics';
var rotations = 5;
var duration = '1970-01-04 00:00:00';

var gr = new GlideRecord('sys_table_rotation');
gr.addQuery('name', tableName);
gr.query();

if (gr.next()) {
    gs.info(getScriptName() + 'The table rotation for ' + tableName + ' table already exists. No record will be created');
} else {
    gr.setWorkflow(true);
    gr.setValue('name', tableName);
    gr.setValue('duration', duration);
    gr.setValue('type', 'rotate');
    gr.setValue('rotations', rotations);
    var sysId = gr.insert();

    gs.info(getScriptName() + 'The table rotation for ' + tableName + ' is now created by the fix-script. sys_id=' + sysId);

}

function getScriptName() {
    return 'Fix_Script:Table rotation for consumer statistics:';
}
