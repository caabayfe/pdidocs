(function executeQuery(v_table, v_query) {

    try {
        var inputs = {};
        inputs['show_all_images'] = true;
        var outputs = sn_fd.FlowAPI.executeAction('sn_docker_spoke.look_up_images', inputs);
        var Results = outputs['images'];
        var status = outputs['status'];
        var error_message = outputs['error_message'];
        var row = {};
        if (status != "Success") {
            throw new Error(error_message);
        } else {
            if (Results != '') {
                for (var i = 0; i < Results.length; i++) {
                    var sysId = i.toString();
                    v_table.addRow({
                        image_id: Results[i].Id.toString(),
                        image_size: Results[i].Size.toString(),
                        sys_id: new GlideDigest().getMD5Hex(sysId)
                    });
                }
            }
        }
    } catch (ex) {
        gs.info(ex);
    }

})(v_table, v_query);
