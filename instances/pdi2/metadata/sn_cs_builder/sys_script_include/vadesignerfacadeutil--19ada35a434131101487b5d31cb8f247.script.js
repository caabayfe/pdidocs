var VADesignerFacadeUtil = Class.create();
VADesignerFacadeUtil.prototype = {
    initialize: function() {
    },

    type: 'VADesignerFacadeUtil',

	_traverseAndReplaceConfig: function (vaInputs, node) {
		var self = this;
		// string
		if (typeof node === 'string') {
			var newValue = node;
			for (var index = 0; index < vaInputs.length; index++) {
				newValue = newValue.replace('{{' + index + '}}', vaInputs[index]);
			}
			return newValue;
		}

		// array
		if (Array.isArray(node)) {
			node.forEach(function(item, index) {
				node[index] = self._traverseAndReplaceConfig(vaInputs, item);
			});
			return node;
		}

		// object
		if (typeof node === 'object') {
			Object.keys(node).forEach(function(key) {
				node[key] = self._traverseAndReplaceConfig(vaInputs, node[key]);
			});
			return node;
		}
		return node;
	},

	buildDefinitionConfig: function(vaInputs) {
		var definitions = JSON.parse(vaInputs.definition.getValue());
		var config = definitions.configuration;
		this._traverseAndReplaceConfig(vaInputs.inputs.getValue(), config);
		return config;
	},

	// Deprecated. 
	// Needed by customers that started using nowassist in VP4, without now-assist-va-designer store app
	buildPromptsHelper: function(vaInputs, type) {
		var definitions = JSON.parse(vaInputs.definition.getValue());
		var config = definitions.configuration;
		this._traverseAndReplaceConfig(vaInputs.inputs.getValue(), config);

		var promptConfig = {};

		switch (type) {
			case 'AITask':
				var isStructured = vaInputs.structured.getValue() === true;
				promptConfig = this.buildAIPrompt(config, isStructured);
			break;
			case 'DataCollector':
				promptConfig = this.buildDataCollector(config);
			break;
			default:
				break;
				
		}
		return promptConfig;
	},

	// Deprecated. 
	// Needed by customers that started using nowassist in VP4, without now-assist-va-designer store app
	buildAIPrompt: function (config, isStructured) {
		var user_message = config.user_message;
		var advanced_parameters = config.advanced_parameters;
		if (isStructured) {
			var identity = config.identity;
			var instructions = config.instructions;
			var skills = config.skills;
			var actions = config.actions;
			var examples = config.examples;

			if (gs.nil(examples)) {
				examples = '';
			}

			var actionsList = [];
			if (actions.length > 0) {
				for (var actionIndex = 0; actionIndex < actions.length; ++actionIndex) {
					var action = actions[actionIndex];
					var payload = {
						action: action.name,
						arguments: action.arguments.reduce(function(values, argument) {
							values[argument.name] = argument.value;
							return values;
						}, {})
					};
					payload = JSON.stringify(payload);

					var parsedAction = {
						index: actionIndex + 1,
						name: action.name,
						description: action.description + '\n',
						example: payload + '\n'
					};

					actionsList.push(parsedAction);
				}
			}

			/// Build Skills List
			var skillsList = [];
			if (skills.length > 0) {
				for (var skillsIndex = 0; skillsIndex < skills.length; ++skillsIndex) {
					var skill = skills[skillsIndex];
					var argumentList = skill.arguments.reduce(function(values, argument) {
						values[argument.name] = argument.value;
						return values;
					}, {});
					argumentList = JSON.stringify(argumentList);

					var parsedSkill = {
						index: skillsIndex + 1,
						id: skill.id,
						instructions: skill.instructions,
						arguments: argumentList
					};

					skillsList.push(parsedSkill);
				}
			}

			return {
				identity: identity,
				instructions: instructions,
				actions: actionsList,
				skills: skillsList,
				examples: examples,
				user_message: user_message,
				advanced_parameters: advanced_parameters
			};

		} else {
			return {
				system_prompt: config.system_prompt,
				user_message: user_message,
				advanced_parameters: advanced_parameters
			};
		}
	},

	// Deprecated. 
	// Needed by customers that started using nowassist in VP4, without now-assist-va-designer store app
	buildDataCollector: function (config) {
		var purpose = config.purpose;
		var inputs = this._migrateInputs(config.inputs);
		var instructions = config.instructions;
		var advanced_parameters = config.advanced_parameters;

		if (gs.nil(instructions)) {
			instructions = '';
		}

		/// Build Inputs List
		var inputList = '\n';
		for(var i = 0; i < inputs.length; i++){
			inputList += JSON.stringify(this._filterInput(inputs[i])) + '\n\n';
		}

		return {
			purpose: purpose,
			inputs: inputList,
			inputsArray: inputs,
			instructions: instructions,
			advanced_parameters: advanced_parameters
		};
	},

	// Deprecated.
	// Needed by customers that started using nowassist in VP4, without now-assist-va-designer store app
	_migrateInputs: function(inputs) {
		var migrated = [];
		inputs.forEach(function(input) {
			if ((typeof input) === 'string') {
				var delimiter = ': ';
				var delimiterIndex = input.indexOf(delimiter);
				var fieldName = input.substr(0, delimiterIndex);
				var description = input.substr(delimiterIndex + delimiter.length);
				migrated.push({ name: fieldName, description: description, type: 'string' });
			} else {
				return migrated.push(input);
			}
		});
		return migrated;
	},

	// Deprecated. 
	// Needed by customers that started using nowassist in VP4, without now-assist-va-designer store app
	_filterInput: function(input) {
		var allowableProperties = [
			'name',
			'type',
			'description',
			'format',
			'choices'
		];
		var arrayUtil = new global.ArrayUtil();
		var filteredInput = {};
		Object.keys(input).forEach(function(name) {
			var value = input[name];
			if (arrayUtil.contains(allowableProperties, name)) {
				filteredInput[name] = value;
			}
		});
		if (input.type === 'reference') {
			filteredInput['notes'] = 'In addition to regular answers, there is a small chance the user may answer with an id/code.';
		}
		return filteredInput;
	}
};
