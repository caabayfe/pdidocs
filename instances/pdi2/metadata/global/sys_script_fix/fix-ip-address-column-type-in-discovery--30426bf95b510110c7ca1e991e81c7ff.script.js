var totalStart = new Date().getTime();
fixIPAddressColumnType();
var totalEnd = new Date().getTime();

gs.debug('FIX_IPADDR_DISCO: [Total execution time = ' + (totalEnd - totalStart) + ' ms]');

function fixIPAddressColumnType() {
    gs.debug("FIX_IPADDR_DISCO: Starting the fix script 'fixIPAddressColumnType'");

    var ipFields = {
        discovery_metric: [{
            'name': 'ip_address'
        }],
        discovery_net_arp_table: [{
            'name': 'ip_address'
        }],
        discovery_range_item_exclude: [{
                'name': 'network_ip',
                'ip_data_control': 'canonical'
            },
            {
                'name': 'end_ip_address',
                'ip_data_control': 'canonical'
            },
            {
                'name': 'start_ip_address',
                'ip_data_control': 'canonical'
            }
        ],
        discovery_range_item_ip: [{
            'name': 'ip_address'
        }]
    };

    IPAddrFixScriptUtil.fixIPAddressColumnType('FIX_IPADDR_DISCO', ipFields);

    gs.debug("FIX_IPADDR_DISCO: End of fix script 'fixIPAddressColumnType'");
}
