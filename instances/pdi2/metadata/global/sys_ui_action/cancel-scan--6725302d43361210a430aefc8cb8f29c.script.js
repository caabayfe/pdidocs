function getProgressId() {
        var resultId = (typeof rowSysId == 'undefined') ? g_form.getUniqueValue() : rowSysId;
        var scan = new GlideRecord('scan_result');
        scan.addQuery('sys_id', resultId);
        scan.query();
        scan.next();
        var workerId = scan.getValue('progress_id');

        return workerId;
    }

    function cancelScan() {
        var ga = new GlideAjax('ScanAjaxProcessor');
        ga.addParam('sysparm_progress_id', getProgressId());
        ga.addParam('sysparm_name', 'cancelScan');
        ga.getXML(renderProgress);
    }

    function renderProgress(response) {
        var map = new GwtMessage().getMessages(['Cancel Scan']);

        ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
            var hspvUtil = new ScanProgressViewerUtil();
            hspvUtil.renderProgressViewer(map['Cancel Scan'], getProgressId());
        });
    }
