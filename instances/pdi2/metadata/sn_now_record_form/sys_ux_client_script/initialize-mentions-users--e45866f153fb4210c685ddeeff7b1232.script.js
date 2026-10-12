/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Create a map to store unique record members
    let recordMembersMap = new Map();
    const fields = api.data?.glide_form_1?.nowRecordFormBlob?.fields;
    const activityStreamMembers = api.data?.glide_form_1?.nowActivityStreamConnected?.userReferences;
    //Store Activity Stream members in recordMembers
    activityStreamMembers.length > 0 && activityStreamMembers.forEach(activityMember => {
        const { sysId, displayName, userName, ...rest } = activityMember;
        recordMembersMap.set(sysId, {
            sys_id: sysId,
            name: displayName,
            username: userName,
            ...rest
        });
    });
    // Store users as recordMembers from field of type reference, with reference to sys_user table
    Object.keys(fields).forEach(function(key,index) {
        const field = fields[key];
        // For glide_list, extract each sys_id
        if(field.type === 'glide_list' && field.reference === 'sys_user' && field.display_value_list.length > 1 ) {
            const sys_ids = field.value.split(',');
            field.display_value_list.forEach((name, index) => {
                recordMembersMap.set(
                    sys_ids[index], 
                    { ...(recordMembersMap.get(sys_ids[index]) || {}),
                        ...{
                            "sys_id": sys_ids[index],
                            "name": name
                        }
                    }
                );
            });
        }
        else if (field.reference === 'sys_user' && field.value) {
            recordMembersMap.set(
                field.value,
                { ...(recordMembersMap.get(field.value) || {}), 
                    ...{
                        "sys_id": field.value,
                        "name": field.displayValue
                    }
                }
            );
        }
    });
    
   const recordMembers = Array.from(recordMembersMap.values());
   api.setState('recordMembers',  recordMembers , false);
}
