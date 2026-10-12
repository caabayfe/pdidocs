var ConfluentUtil = Class.create();
var CONFLUENT_REGISTRY_FLOW_TIME_OUT = GlideProperties.getInt("com.glide.confluent_registry.flow_timeout", 90) * 1000;

ConfluentUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	// executes a Flow Designer Action with a REST step that makes an API call to Confluent Schema Registry to retrieve all the Subjects
    getSubjects: function() {
        try {
			var inputs = {};
            var outputs = sn_fd.FlowAPI.executeAction('global.confluent_get_subjects', inputs, CONFLUENT_REGISTRY_FLOW_TIME_OUT);

			return outputs.response;
        } catch (ex) {
            return JSON.stringify({
                "errorMessage": ex.getMessage()
            });
        }
    },

	// executes a Flow Designer Action with a REST step that makes an API call to Confluent Schema Registry. 
	// The inputs to the Action are subject and version. The API call retrieves the Schema with the subject and version

    getSchema: function(schema_subject, schema_version) {
        try {
            var inputs = {};
            inputs['subject'] = schema_subject;
            inputs['version'] = schema_version;
            var outputs = sn_fd.FlowAPI.executeAction('global.confluent_get_schema', inputs, CONFLUENT_REGISTRY_FLOW_TIME_OUT);
            return outputs.response;
        } catch (ex) {
            return JSON.stringify({
                "errorMessage": ex.getMessage()
            });
        }
    },

	// executes a Flow Designer Action with a REST step that makes an API call to Confluent Schema Registry. 
	// The input to the Action is subject. The API call retrieves the versions for the subject

    getVersions: function() {
        try {
            var inputs = {};
            inputs['subject'] = this.getParameter('sysparm_subject');
            var outputs = sn_fd.FlowAPI.executeAction('global.confluent_get_versions', inputs, CONFLUENT_REGISTRY_FLOW_TIME_OUT);
            return outputs.response;
        } catch (ex) {
            return JSON.stringify({
                "errorMessage": ex.getMessage()
            });
        }
    },
	
    type: 'ConfluentUtil'
});
