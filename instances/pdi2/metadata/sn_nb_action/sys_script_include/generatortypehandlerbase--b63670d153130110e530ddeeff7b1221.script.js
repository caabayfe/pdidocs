var GeneratorTypeHandlerBase = Class.create();
GeneratorTypeHandlerBase.prototype = {

    /*
     * This is used to identify the generator type.
     * Should return the sysId of generator type record for which this script is implemented
     */
    getId: function() {
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('No implementation of getId found, getId of base generator type handler is called.');
    },

    /**********
     * Checks and validate the current resource generator record
     *
     * @param.resourceGeneratorRecord GlideRecord of resource generator to be validated
     * @return isValid flag as true if all looks good. Else, returns isValid as false with errorMessage
     **********/
    isValid: function(param) {
        /*********
        For success scenario this function should return result in below format:
        {
            'isValid': true
        }

        For error scenario this function should return result in below format:
        {
            'isValid': false,
            'errorMessage': '' // this will be shown to the user on the resource generator form
        }
        **********/
        return {
            'isValid': true
        };
    },

    /**********
     * Generates output schema for current generator type and returns the expected output structure of getGeneratorOutputs()
     * 
     * @param param.inputs JSON containing generator type input name:value pairs
     * @param param.generatorRecord Generator record selected in resource generator when using custom input generator type
     * @return JSON containing list of output's metadata
     **********/
    getOutputSchema: function(param) {
        /*********
        For success scenario this function should return result in below format:
        {
            'status': 'success',
            'schema': [ 
                // List of records to show in pill picker
                {
                    'name': '', // string
                    'label': '', // string
                    'type': '' // this value should be either 'string' or 'reference'
                    // if type is 'reference'
                    'referenceTable': '' // table name. Eg. 'incident'
                },
                {}
            ]
            'metaData': {
                'confidence': '', // name of the field which will have confidence score for the recommendation
             }
        }
            
        For error scenario this function should return result in below format:
        {
            'status': 'error',
            'errorCode': 40001,
            'errorMessage': '' // this will be logged and displayed while creating experience
        }
        **********/
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('getOutputSchema of base generator type handler is called.');
        return {
            'status': Constants.STATUS_SUCCESS,
            'schema': [],
            'metaData': {}
        };
    },

    /**********
     * Generates generator outputs for given record and inputs
     * 
     * @param param.contextRecord Current record for which we are evaluating
     * @param param.inputs JSON containing generator type input name:value pairs	 
     * @param param.generatorRecord Generator record selected in resource generator when using custom input generator type
     * @return JSON containing list of generator outputs
     **********/
    getOutputs: function(param) {
        /**********
        For success scenario this function should return result in below format:
        {
            'status': 'success',
            'outputs': [
                 // List of key value pair
                 {
                     'name': 'value'
                 }
            ]
        }
        
        For error scenario this function should return result in below format:
        {
            'status': 'error',
            'errorCode': 40001,
            'errorMessage': '' // this will be logged
        }
        **********/
        var log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        log.warn('getOutputs of base generator type handler is called.');
        return {
            'status': Constants.STATUS_SUCCESS,
            'outputs': []
        };
    },

    type: 'GeneratorTypeHandlerBase'
};
