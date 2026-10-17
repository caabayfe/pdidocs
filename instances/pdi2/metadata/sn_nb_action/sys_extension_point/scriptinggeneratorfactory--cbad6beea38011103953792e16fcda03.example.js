var ScriptingGeneratorFactory = Class.create();
ScriptingGeneratorFactory.prototype = Object.extendsObject(sn_nb_action.ScriptingGeneratorHandlerBase, {
    category: 'ra_scripting_generator', // DO NOT REMOVE THIS LINE!

    /*
     * This is used to identify the script generator.
     * Should return the API Name of the implementation
     */
    getId: function() {},

    /**********
     * Generates output schema for 'Scripting' generator and returns the expected output structure of getGeneratorOutputs()
     * 
     * @return JSON containing list of output's metadata
     **********/
    getOutputSchema: function() {
        /*********
        For success scenario this function should return result in below format:
        {
            'status': 'success',
            'schema': [ 
                // List of records to show in pill picker
                {
                    'name': '', // string
                    'label': '', // string
                    'type': '', // this value should be either 'string' or 'reference'
                    // if type is 'reference'
                    'referenceTable': '' // table name. Eg. 'incident'
                },
                {}
            ],
            'metaData': {
                'confidence': '' // name of the field which will have confidence score for the recommendation
             }
        }
            
        For error scenario this function should return result in below format:
        {
            'status': 'error',
            'errorCode': 40001,
            'errorMessage': '' // this will be logged and displayed while creating experience
        }
        **********/
    },
    /**********
     * Generates generator outputs for given record and inputs
     * 
     * @param param.contextRecord Current record for which we are evaluating
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
    },
    type: 'ScriptingGeneratorFactory'
});
