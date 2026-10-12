var RelatedListIncidentItemUpdateHandler = Class.create();
    var updateSource;
    RelatedListIncidentItemUpdateHandler.prototype = {
        initialize: function(reqInfo) {
            this.sowMraUtils = new SOWMraUtils();
            this.parentIncidents = this.sowMraUtils.getParentIncidents(reqInfo.newItemsQuery || reqInfo.itemFilterQuery, reqInfo.parentRecordSysId);
            updateSource = "RelatedListIncidentItemUpdateMRA";
        },
    
        handles: function(extensionPointKey){
            return extensionPointKey == "CHILD_INCIDENT_QUERY_FILTER";
        },
    
        postUpdate: function(reqInfo) {
            this.sowMraUtils.updateChildIncidentCount(reqInfo.parentRecordSysId);
            for (var i = 0; i < this.parentIncidents.length; i++)
                this.sowMraUtils.updateChildIncidentCount(this.parentIncidents[i]);
        },
    
        type: 'RelatedListIncidentItemUpdateHandler'
    };
