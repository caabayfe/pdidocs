function script({api, event}) {
      const params = event?.payload?.params ?? {};
      params.extraParams = Object.keys(params).map((x) => { return `${x}/${params[x]}` }).join("/");
      
      api.emit("NAV_ITEM_SELECTED", {
        "route": "record",
        "targetRoute": "current",
        "fields": {
          "sysId" : event.payload.sys_id,
          "table" : event.payload.table
        },			
        "params": params,
        "redirect": true
      });
}
