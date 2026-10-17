var UXAHandler = Class.create();
UXAHandler.prototype = {
    initialize: function() {
        this.analysisService = new UXAAppAnalysisService();
    },

    handleDARequest: function(params) {
        const uiAdaptor = new UXAUIAdaptor();
        const util = new UXAUtils();
        //const uxaService = new UXAVizService();
        let responses = [];
        params.dataConfigurations?.forEach((dataConfiguration, index) => {
            const uxaDTO = uiAdaptor.createDTO(dataConfiguration, params.filterConfigurations);
            const uxaService = new UXAVizService(uxaDTO);
            const response = uxaService.processDARequest(uxaDTO);
            response.order = index;

            const eventData = util.getEventData(uxaDTO, params.filterConfigurations, dataConfiguration);

            // add event data for drill down
            if (response.response) {
                if (!response.response.metadata) {
                    response.response.metadata = {};
                }

                response.response.metadata = {
                    ...response.response.metadata,
                    dataSourceType: UXAConstants.APPSEE
                };

                if (!response.response.metadata.eventData) {
                    response.response.metadata.eventData = {};
                }

                response.response.metadata.eventData = {
                    ...response.response.metadata.eventData,
                    ...eventData
                };
            }

            responses.push(response);
        });
        return responses;
    },

    handleQueryRequest: function(params) {
        let responses = this.handleDARequest(params);
        return (responses.length == 1) ? responses[0] : responses;
    },

    handleMetadataRequest: function(params) {
        const uxaService = new UXAMetadataService();
        return uxaService.processMetadataRequest(params);
    },

    handleFunnelRequest: function(params, isFetch = false) {
        const uiAdaptor = new UXAUIAdaptor();
        let response;
        if (params.isSingle === true) {
            const uxaDTO = uiAdaptor.createDTO(params.dataConfigurations[0], params.filterConfigurations);
            const analysisService = new UXAAppAnalysisService(uxaDTO);
            response = analysisService.fetchSingleFunnelData(uxaDTO);
        } else {
            if (isFetch)
                response = this.analysisService.fetchFunnelRecords(params);
            else
                response = this.analysisService.updateFunnelRecord(params);
        }
        return response;
    },

    handleNavigationPathsRequest: function(params) {
        let response;
        const uiAdaptor = new UXAUIAdaptor();
        const uxaDTO = uiAdaptor.createDTO(params.dataConfigurations[0], params.filterConfigurations);
        const analysisService = new UXAAppAnalysisService(uxaDTO);

        response = analysisService.fetchNavigationPathsData(uxaDTO);

        return response;
    },

    handleCohortRequest: function(params, isFetch = false) {
        const uiAdaptor = new UXAUIAdaptor();
        const analysisService = new UXAAppAnalysisService();
        let response;
        if (params.isSingle === true) {
            const uxaDTO = uiAdaptor.createDTO(params.dataConfigurations[0], params.filterConfigurations);
            const analysisService = new UXAAppAnalysisService(uxaDTO);
            response = analysisService.fetchSingleCohortData(uxaDTO);
        } else {
            if (isFetch)
                response = analysisService.fetchCohortRecords(params);
            else
                response = analysisService.updateCohortRecord(params);
        }
        return response;

    },

    type: 'UXAHandler'
};
