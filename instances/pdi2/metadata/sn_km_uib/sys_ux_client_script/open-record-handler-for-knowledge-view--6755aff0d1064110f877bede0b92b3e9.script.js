function script({
            api,
            helpers,
            event,
            imports
        }) {
            const {
                payload
            } = event;
        const table = payload.table + "";
        var redirectPayload = {
            redirect: true,
            targetRoute: 'current',
            fields: {
                sysId: payload.sys_id + "",
                table: table
            }
        };
        if(table == 'kb_knowledge' || table.startsWith('kb_template') || table.startsWith('u_kb_template') || table == 'kb_knowledge_block')
            redirectPayload.route = 'kb_view';
        else
            redirectPayload.route = 'record';
        
        if(api.context.props.overridePageEvents){
            api.emit("SN_KNOWLEDGE_VIEW#LINK_CLICKED", redirectPayload);
            return;
        }        
        api.emit("NAV_ITEM_SELECTED", redirectPayload);
        }
