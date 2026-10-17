// Discovery

var QuickRanges = Class.create();

QuickRanges.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_onMakeRanges: function() {
        var ipAddress = SncIPAddress;
        var ipNetwork = SncIPNetworkV4;
        var ipRange   = SncIPRangeV4;
        var ranges = this.getParameter('sysparm_ranges');
        var table = this.getParameter('sysparm_mr_table');
        var id = this.getParameter('sysparm_mr_id');
        
        var elements = ranges.split(',');
        var ipList = new SncIPList();
        for (var i = 0; i < elements.length; i++) {
            var elem = (elements[i]+'').replace(/[\r\n]/gm, '');
            var coll = ipNetwork.getIPNetworkFromDDecimal(elem);
            if (coll) {
                var parts = ('' + coll.getNetworkAsString()).split('/');
                var gr = this.createItem(table, id, 'IP Network');
                gr.setValue('network_ip', parts[0]);
                gr.setValue('netmask', parts[1]);
                gr.insert();
                continue;
            }
            coll = ipRange.getIPRangeV4FromDDecimal(elem);
            if (coll) {
                var gr = this.createItem(table, id, 'IP Address Range');
                gr.setValue('start_ip_address', coll.getBeginAddress().getAddressAsString());
                gr.setValue('end_ip_address', coll.getEndAddress().getAddressAsString());
                gr.insert();
                continue;
            }
            coll = ipAddress.fromString(elem);
            if (coll) {
                ipList.add(coll);
                continue;
            }
        }
        if (ipList.size() > 0) {
            var gr = this.createItem(table, id, 'IP Address List');
            var item_id = gr.insert();
            gr = new GlideRecord('discovery_range_item_ip');
            var it = ipList.iterator();
            while (it.hasNext()) {
                var ip = it.next().getAddressAsString();
                gr.initialize();
                gr.setValue('ip_address', ip);
                gr.setValue('item_parent', item_id);
                gr.insert();
            }
        }
    },
    
    createItem: function(table, id, type) {
        var gr = new GlideRecord('discovery_range_item');
        gr.initialize();
        gr.setValue('type', type);
        if (table == 'discovery_schedule')
            gr.setValue('schedule', id);
        else
            gr.setValue('parent', id);
        gr.setValue('active', true);
        return gr;
    }
});
