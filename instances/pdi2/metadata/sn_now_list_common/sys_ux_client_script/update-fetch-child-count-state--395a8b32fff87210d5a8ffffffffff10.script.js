function script({api, event}) { 

const {table, query, groupBy, parentRowSysIdFullPathKey} = event.payload;  
const fetchChildrenPayload = {table: table,query: query,groupBy: groupBy, parentRowSysIdFullPathKey:parentRowSysIdFullPathKey};
api.setState('fetchChildrenPayload', fetchChildrenPayload);

 }
