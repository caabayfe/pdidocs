var UXATransformer = Class.create();
UXATransformer.prototype = {
    initialize: function() {},

    getTransformer: function(uxaDTO) {
        let transformer;
        switch (uxaDTO.getDataCategory()) {
            case UXAConstants.DATA_CATEGORY.SIMPLE:
                transformer = new UXASimpleTransformer();
                break;
            case UXAConstants.DATA_CATEGORY.GROUP:
                transformer = new UXAGroupTransformer();
                break;
            case UXAConstants.DATA_CATEGORY.TREND:
                transformer = new UXATrendTransformer();
                break;
            case UXAConstants.DATA_CATEGORY.TIMESTAMP:
                transformer = new UXASimpleTransformer();
                break;
            case UXAConstants.DATA_CATEGORY.DATATABLE:
                if (['events', 'pages', 'sessions', 'users', 'application'].includes(uxaDTO.getType())) {
                    if (UXAConstants.METRIC.TABLE == uxaDTO.getMetric()) {
                        transformer = new UXADatatableTransformer();
                    } else if (UXAConstants.METRIC.COUNT == uxaDTO.getMetric()) {
                        transformer = new UXADatatableCountTransformer();
                    } else if (UXAConstants.METRIC.EVENT_EXPORT == uxaDTO.getMetric()) {
                        transformer = new UXACSVTransformer();
                    } else {
                        transformer = this;
                    }
                } else {
                    transformer = this;
                }
                break;
            case UXAConstants.DATA_CATEGORY.FUNNEL:
                transformer = new UXAFunnelTransformer();
                break;
            case UXAConstants.DATA_CATEGORY.COHORT:
                transformer = new UXACohortTransformer();
                break;
            default:
                transformer = this;
                break;

        }
        return transformer;
    },

    getMetadataTransformer: function(filterID) {
        if ([UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_INDICATOR, UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY, UXAConstants.UXA_FILTER_ID.EVENT].includes(filterID))
            return new EventPropertyMetadataTransformer();
        else
            return new UXAMetadataTransformer();
    },

    transform: function(response) {
        return response;
    },

    type: 'UXATransformer'
};
