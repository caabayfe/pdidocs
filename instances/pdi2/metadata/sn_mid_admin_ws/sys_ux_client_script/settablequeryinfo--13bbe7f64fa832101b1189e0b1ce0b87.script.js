/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var data = api.state.contentTreeItems;
    var midSysId = api.context.props.sysId;
    var midName = api.data.mid_server_look_up_a_single_record.result.name.value;
    var result = {};
    
    data.forEach(item => {
        // process the top-level item and (optionally) its first-level children
        const nodes = [item].concat(Array.isArray(item.children) ? item.children : []);
        
        nodes.forEach(node => {
            const v = (node && node.value) || {};
            const table = v.table;
            if (!table) return; // skip items without table
            const id = node.id;
            const refField   = v.refField;
            const extraQuery = (v.encodedQuery || '').trim();
            
            // default q
            let q = 'sys_idISEMPTY';
            
            if (refField && midSysId) {
                // base: refField=<mid sys_id> OR for ecc_queue use mid.server.<midName> when provided
                let base = `${refField}=${midSysId}`;
                
                if (table === 'ecc_queue' && midName) {
                    base = `${refField}=mid.server.${midName}`;
            }
            if (extraQuery) {
                q = base + (extraQuery.startsWith('^') ? extraQuery : '^' + extraQuery);
            } else {
                q = base;
            }
      }

      // assign computed q for this table
      result[id] = {};
      result[id].table = table;
      result[id].query = q;
    });
  });

  api.setState("tableQueryInfo", result);
}
