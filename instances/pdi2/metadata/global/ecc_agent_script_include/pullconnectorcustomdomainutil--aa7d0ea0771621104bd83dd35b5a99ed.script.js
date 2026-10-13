var PullConnectorCustomDomainUtil = Class.create();
PullConnectorCustomDomainUtil.prototype = {
    initialize: function() {
		this.isDebug = "" + probe.getAdditionalParameter("debug");
    },
	populateDomain : function(probe, event, payload){

		var domainAdditionalInfo = {};
		var payloadDomainInfoFieldName = probe.getAdditionalParameter("payloadDomainInfoFieldName");
		var payloadDomainInfoFieldValue = probe.getAdditionalParameter("payloadDomainInfoFieldValue");


		var connectorDomainInfoTableName = probe.getAdditionalParameter("connectorDomainInfoTableName");
		var connectorDomainInfoColumnName = probe.getAdditionalParameter("connectorDomainInfoColumnName");
		var connectorDomainIdColumnName = probe.getAdditionalParameter("connectorDomainIdColumnName");
		var connectorDomainPathColumnName = probe.getAdditionalParameter("connectorDomainPathColumnName");

		// if neither payloadDomainInfoFieldName nor payloadDomainInfoFieldValue has a valid value skip
		if(this.isValidValue(payloadDomainInfoFieldName) || this.isValidValue(payloadDomainInfoFieldValue)){
			
			if(this.isValidValue(payloadDomainInfoFieldName)){
				if(this.isValidValue(payload[payloadDomainInfoFieldName])){
					domainAdditionalInfo["payloadDomainInfoFieldValue"] = payload[payloadDomainInfoFieldName];
				}else{
					ms.log("Custom Domain Separation - Value not found in the payload for the given payloadDomainInfoFieldName key : " + payloadDomainInfoFieldName);
				}
			}else if(this.isValidValue(payloadDomainInfoFieldValue)){
				domainAdditionalInfo["payloadDomainInfoFieldValue"] = payloadDomainInfoFieldValue;
			}
			
			if(this.isValidValue(connectorDomainInfoTableName)){
				domainAdditionalInfo["connectorDomainInfoTableName"] = connectorDomainInfoTableName;
			}
			if(this.isValidValue(connectorDomainInfoColumnName)){
				domainAdditionalInfo["connectorDomainInfoColumnName"] = connectorDomainInfoColumnName;
			}
			if(this.isValidValue(connectorDomainIdColumnName)){
				domainAdditionalInfo["connectorDomainIdColumnName"] = connectorDomainIdColumnName;
			}
			if(this.isValidValue(connectorDomainPathColumnName)){
				domainAdditionalInfo["connectorDomainPathColumnName"] = connectorDomainPathColumnName;
			}
			for(key in domainAdditionalInfo){

				event.setField(key, domainAdditionalInfo[key]);
			}

			this.debug(this.isDebug,"Domain Information : "+JSON.stringify(domainAdditionalInfo));
		}
	},

	isValidValue: function(value){

		if(value && value.trim() != '' && value != 'null')
			return true;
		else{
			this.debug(this.isDebug,"provided parameter value is invalid : "+value);
			return false;
		}
	},

	debug: function(isDebug, message) {

        if (isDebug == true || isDebug == "true") {
            ms.log("Custom Domain Separation : " + message);
        }
        return true;
    },
	
    type: 'PullConnectorCustomDomainUtil'
};

PullConnectorCustomDomainUtil.get = function(){
	return new PullConnectorCustomDomainUtil();
};
