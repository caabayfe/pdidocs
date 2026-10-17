var DocumentAnalyticsAPI = Class.create();
DocumentAnalyticsAPI.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'DocumentAnalyticsAPI',
    category: 'document_creation',
    instrumentationPoint: 'document_record',
    instrumentationEvent: 'record_creation',

    sendDataFromClient: function() {
        var documentCreationSourceObj = this.getParameter('sysparm_document_creation_source');
        var documentCreationSource = this._convertObjectToString(documentCreationSourceObj);
        this.sendData(documentCreationSource);
    },

    sendData: function(documentCreationSource) {
        var sm = new GCFSampleMap();
        sm.put('document_creation_source', documentCreationSource);
        GCFCollector.recordUsageEvent(this.category, this.instrumentationPoint, this.instrumentationEvent, sm);
    },

    _convertObjectToString: function(object) {
        return JSON.stringify(object).replace(/"/g, '');
    },

});
