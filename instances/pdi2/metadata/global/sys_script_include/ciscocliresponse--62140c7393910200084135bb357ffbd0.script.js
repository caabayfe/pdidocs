// Discovery class

var CiscoCliResponse = Class.create();

CiscoCliResponse.prototype = {
	
	initialize: function(result) {
        this.ciscoCliInfo = result.device;
    },
    
    getGroups: function(){

        if (JSUtil.has(this.ciscoCliInfo['groups'])){
            if (!(this.ciscoCliInfo.groups['group'] instanceof Array)){
                return [this.ciscoCliInfo.groups['group']];
            }
            return this.ciscoCliInfo.groups['group'];
        }
		return null;	
    },
    
    getServers: function(){
        if (JSUtil.has(this.ciscoCliInfo['servers'])){
            if (!(this.ciscoCliInfo.servers.server instanceof Array)){
                return [this.ciscoCliInfo.servers['server']];
            }
            return this.ciscoCliInfo.servers['server'];
        }
        return null;
    },
    
    getVips: function(){
        if (JSUtil.has(this.ciscoCliInfo['vips'])){
            if (!(this.ciscoCliInfo.vips['vip'] instanceof Array)){
                return [this.ciscoCliInfo.vips['vip']];
            }
            return this.ciscoCliInfo.vips['vip'];
        }
        return null;
    },
    
    getInterfaces: function(){
        if (JSUtil.has(this.ciscoCliInfo['interfaces'])){
            if (!(this.ciscoCliInfo.interfaces['interface'] instanceof Array)){
                return [this.ciscoCliInfo.interfaces['interface']];
            }
            return this.ciscoCliInfo.interfaces['interface'];
        }
        return null;
    },
	
    type: "CiscoCliResponse"
};
