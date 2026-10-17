var totalStart = new Date().getTime();
fixIPAddressColumnType();
var totalEnd = new Date().getTime();

gs.debug('FIX_IPADDR_DISCO_CORE: [Total execution time = ' + (totalEnd - totalStart) + ' ms]');

function fixIPAddressColumnType() {
    gs.debug("FIX_IPADDR_DISCO_CORE: Starting the fix script 'fixIPAddressColumnType'");

    var ipFields = {
        discovery_range_item: [{
                'name': 'end_ip_address',
                'ip_data_control': 'canonical'
            },
            {
                'name': 'start_ip_address',
                'ip_data_control': 'canonical'
            },
            {
                'name': 'network_ip',
                'ip_data_control': 'canonical'
            }
        ],
        dscy_credentials_affinity: [{
            'name': 'ip_address',
            'ip_data_control': 'canonical'
        }],
        dscy_priv_command_affinity: [{
            'name': 'ip_address',
            'ip_data_control': 'canonical'
        }],
        ecc_agent: [{
                'name': 'router',
                'ip_data_control': 'canonical'
            },
            {
                'name': 'ip_address',
                'ip_data_control': 'canonical'
            }
        ],
        ecc_agent_ip_address: [{
            'name': 'ip_address',
            'ip_data_control': 'canonical'
        }],
        ecc_agent_router: [{
            'name': 'router',
            'ip_data_control': 'canonical'
        }],
        ecc_agent_command_audit_log: [{
            'name': 'target_device'
        }],
        ip_service_affinity: [{
            'name': 'ip_address',
            'ip_data_control': 'canonical'
        }]
    };

    IPAddrFixScriptUtil.fixIPAddressColumnType('FIX_IPADDR_DISCO_CORE', ipFields);

    gs.debug("FIX_IPADDR_TYPE: End of fix script 'fixIPAddressColumnType'");
}
