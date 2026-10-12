/**
*  @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/

function handler({ api, event }) {
  var v = {};
  var label = null;
  var id = null;
  const item     = event?.payload?.item;
  if (!item) {
    var allData = api.state.contentTreeItems;
    var itemId = api.context.props.selectedItem;
    if (itemId) {
      id = itemId;
      var found = false;
      for (var i =0 ; i< allData.length && !found; i++) {
          if (allData[i].id == id){
            found = true;
            v = allData[i].value || {};
            label = allData[i].label;
          }
          if (!found) {
            if (allData[i].children) {
              for (var j =0 ; j < allData[i].children.length && !found ; j++) {
                var child = allData[i].children[j];
                if (child.id == id) {
                  found = true;
                  v = child.value;
                  label = child.label;
                }
              }
            }
          }
      }
    }
  } else {
    v        = item.value || {};
    label    = item.label;
    id       = item.id;
  }
  
  const table    = v.table;
  const refField = v.refField;
  const description = v.description;
  const mid      = api.context.props.sysId; 
  const colStr   = v.columns || '';
  const parent_id = v.parent_id || '';
  var extraQuery= (v.encodedQuery || '').trim();
  var info = {}

  if (id == 'p1' || id == 'p2' || Object.keys(v).length === 0) {
    var a1 = [];
    a1.push(id);
    if(a1[0] != null){
      api.setState('contentTreeSelectedItem', a1);
    }    
  }
  if ( id != 'p1' && id != 'p2') {
    if (label) api.setState('activeTab', id);
    if (!table) {
      info.table = null;
      info.query = null;
      info.columns = "";
      api.setState('relatedTableInfo', info);
      return;
    }
  }

  if (!table) {
    return; 
  }
  
  info.table = table;
  //Get table for Manage slush bucket
  if(table.endsWith('_m2m')) {
    let slushBucketTable = table.replace(/_m2m$/, '');
    api.setState('slushBucketTable', slushBucketTable);
    api.emit('TRIGGER_PREPARE_RELATED_LIST_EDIT_RECORD_URL_SCRIPT');
  }
  api.emit('TRIGGER_PREPARE_RELATED_LIST_NEW_RECORD_URL_SCRIPT');
  info.columns = colStr;
  let q = 'sys_idISEMPTY';             
  if (refField && mid) {
    var base = `${refField}=${mid}`;
    if (table == 'ecc_queue') {
      const midName = api.data.mid_server_look_up_a_single_record?.result?.name?.value;
      if (midName){
        base =  `${refField}=mid.server.${midName}`;
      }
    }
    
    if (extraQuery) {
      if (!extraQuery.startsWith('^')) {
        extraQuery = '^' + extraQuery;
      }
      q = base + extraQuery;
    } else {
      q = base;
    }
  }
  info.query = q;
  info.description = description;
  api.setState('relatedTableInfo', info);
  var selectedItem = [];
  if (parent_id != '')
    selectedItem.push(parent_id);
  selectedItem.push(id); 
  api.setState('contentTreeSelectedItem', selectedItem);
}
