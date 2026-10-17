/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var allData = api.data.mid_server_look_up_a_single_record.result;
    const dataToShow = ['host_name', 'ip_address','user_name','version', 'validated','host_type','win_domain', 'is_using_custom_cert','is_using_mutual_auth','invalidated_at','invalidated_by','router','network','last_refreshed','started','stopped','timezone','host_total_ram', 'host_hyperthreading','host_cpu_core_count','host_glibc_version','host_cpu_speed','host_disk_size','host_powershell_version','mid_maximum_ram','mid_java_command_dir'];
    const dataSet1 = ['host_name', 'ip_address','user_name','version', 'host_type','win_domain', 'is_using_custom_cert','is_using_mutual_auth','invalidated_at','invalidated_by','router','network','last_refreshed','started','stopped'];
    const bannerData = ['version', 'validated','host_type', 'last_refreshed'];
    const dates = ['invalidated_at', 'last_refreshed'];
    var set1 = [];
    var set2 = [];
    var banner_items = [];
    var status = allData.status.value;
    var stObj = {};
    stObj.label = 'Status';
    stObj.value = {};
    stObj.value.type = 'highlighted-value';
    stObj.value.label = status;
    stObj.value.size = 'md';
    if (status == 'Down' || status == 'Upgrade Failed') {
        stObj.value.color = 'critical';
        stObj.value.icon = 'close-outline';
    } else {
        if (status == 'Paused' || status == 'Upgrading') {
            stObj.value.color = 'warning';
            stObj.value.icon = 'close-outline';
        } else {
            stObj.value.color = 'positive';
            stObj.value.icon = 'check-outline';
        }
    }
    banner_items.push(stObj);

    
    var version_color = api.data.get_mid_server_details.output.version.highlight_color;
    var version_icon = 'close-outline';
    if (version_color == 'positive')
        version_icon = 'check-outline';
    for (var i = 0 ;  i < dataToShow.length; i++) {
        var field = dataToShow[i];
        if (allData[field]) {
            var x = [];
            var n = {};
            n.label = allData[field].label;
            n.value = {};
            if (field === 'version') {
                n.value.type = 'highlighted-value';
                n.value.label = allData[field].value ? allData[field].value : 'N/A';
            } else {
                n.value.type = 'string';
                if (field === 'is_using_custom_cert' || field === 'is_using_mutual_auth' || field === 'host_hyperthreading') {
                    if (allData[field].value) 
                        n.value.value = 'Yes';
                    else 
                        n.value.value = 'No';
                } else {
                    if (field === 'validated') {
                        switch (allData[field].value) {
                            case 'true':
                                n.value.value = 'Yes';
                                break;
                            case 'false':
                                 n.value.value = 'No';
                                 break;                        
                            default:
                                n.value.value = allData[field].value ? allData[field].displayValue : 'N/A';
                                break;
                        }
                    } else {
                        if (dates.includes(field)) {
                            n.value.value = allData[field].displayValue ? allData[field].displayValue : 'N/A';
                        } else 
                            n.value.value = allData[field].value ? allData[field].value : 'N/A';
                    }
                }
                
            }
            if (field === 'version') {
                n.value.color = version_color;
                n.value.icon = version_icon;
                n.value.size ='md';
            }

            if (bannerData.includes(field)){
                banner_items.push(n);
            } else {
                x.push(n);
                if (dataSet1.includes(field)){
                    set1.push(x);
                } else {
                    set2.push(x);
                }
            }
        }
    }
    api.setState('serverDetailsSet1', set1);
    api.setState('serverDetailsSet2', set2);
    api.setState('bannerDetailsItems', banner_items);
}
