(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var pathparams = request.pathParams;
    var exportSysId = pathparams.export_id;

    var grSysAutoPar = new GlideRecordSecure('sysauto_par');
    var grParExport = new GlideRecordSecure('par_export');
    var grNotification = new GlideRecordSecure('par_notification_email');


    if (!grSysAutoPar.get(exportSysId)) {
        var notFoundErr = new sn_ws_err.ServiceError();
        notFoundErr.setStatus(404);
        notFoundErr.setMessage('Invalid sys_id : No scheduled job found');
        response.setError(notFoundErr);
        return;
    } else {
        if (!grSysAutoPar.canDelete()) {
            var permError = new sn_ws_err.ServiceError();
            permError.setStatus(403);
            permError.setMessage('You do not have access to delete the scheduled job');
            permError.setDetail('You do not have permission to scheduled par export jobs');
            response.setError(permError);
            return;
        }
        var sysIds = grSysAutoPar.getValue('to_export');
        var notSysIds = grSysAutoPar.getValue('notification');

        //delete par_export records (both viz and dashboards)
        grParExport.addQuery('sys_id', 'IN', sysIds);
        grParExport.query();
        while (grParExport.next())
            grParExport.deleteRecord();

        //delete from notification
        grNotification.addQuery('sys_id', 'IN', notSysIds);
        grNotification.query();
        while (grNotification.next())
            grNotification.deleteRecord();

        //delete from sysAutoPar
        grSysAutoPar.deleteRecord();

        return {
            status: 'Successfully deleted the scheduled job'
        };
    }

})(request, response);
