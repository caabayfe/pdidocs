doMonitor();

function doMonitor() {
    var rt = current.getValue('response_to');
    var gr = new GlideRecord('ecc_queue');
    if (!rt || !gr.get('sys_id', rt))
        return;

    var start = gr.sys_created_on.getGlideObject().getRaw().getTime();
    var finish = current.sys_created_on.getGlideObject().getRaw().getTime();
    var delta = finish - start;
    SncProbeRunTime.get().record(delta);
}
