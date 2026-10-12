gs.info('Updating cert instance agg data with instance id: ' + event.parm1);
new sn_cmdb_ws.CMDBWsDMCertDashboardManager().calculateInstanceAggDataByInstanceId(event.parm1);
