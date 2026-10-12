var totalStart = new Date().getTime();
fixCmdbIPAddressColumnType();
var totalEnd = new Date().getTime();

gs.debug('FIX_IPADDR_CMDB: [Total execution time = ' + (totalEnd - totalStart) + ' ms]');

function fixCmdbIPAddressColumnType() {
    gs.debug("FIX_IPADDR_CMDB: Starting the fix script 'fixCmdbIPAddressColumnType'");

    var ipFields = {
        cmdb_alias: [{
            'name': 'ip_address'
        }],
        cmdb_ci: [{
            'name': 'ip_address'
        }],
        cmdb_ci_network_adapter: [{
            'name': 'ip_default_gateway'
        }],
        cmdb_ip_address_range: [{
                'name': 'start_ip'
            },
            {
                'name': 'end_ip'
            }
        ],
        cmdb_switch_port: [{
            'name': 'ip_address'
        }],
        cmdb_tcp: [{
            'name': 'ip'
        }],
        cmdb_tcp_connection: [{
                'name': 'from_ip'
            },
            {
                'name': 'to_ip'
            }
        ],
        cmdb_tcp_half: [{
                'name': 'from_ip'
            },
            {
                'name': 'to_ip'
            }
        ],
        dscy_route_next_hop: [{
            'name': 'next_hop_ip_address'
        }],
        dscy_swtch_partition: [{
            'name': 'base_ip_address'
        }]
    };

    IPAddrFixScriptUtil.fixIPAddressColumnType('FIX_IPADDR_CMDB', ipFields);

    gs.debug("FIX_IPADDR_CMDB: End of fix script 'fixCmdbIPAddressColumnType'");
}
