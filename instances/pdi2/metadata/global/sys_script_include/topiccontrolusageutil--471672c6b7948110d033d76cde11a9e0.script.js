var TopicControlUsageUtil = Class.create();
    TopicControlUsageUtil.prototype = {
        initialize: function() {
			this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
    },

    _hasExistingUsageData: function(cs_topic_id) {
        var gr = new GlideRecord('sys_cs_topic_control_usage');
        gr.addQuery('cs_topic_id', cs_topic_id);
        gr.query();
        return gr.hasNext();
    },

    _deleteExistingUsageData: function(cs_topic_id) {
        var gr = new GlideRecord('sys_cs_topic_control_usage');
        gr.addQuery('cs_topic_id', cs_topic_id);
        gr.query();
        gr.deleteMultiple();
    },

    _stringifyUsage: function(usage) {
        if (!usage || JSON.stringify(usage) === '{}') {
            return null;
        }
        return JSON.stringify(usage);
    },

    _saveNodeData: function(cs_topic_id, version, node, subtype, usage) {
        var gr = new GlideRecord('sys_cs_topic_control_usage');
        gr.initialize();
        gr.cs_topic_id = cs_topic_id;
        gr.node_id = node.id;
        gr.node_name = node.name;
        gr.step_type = node.stepType;
        gr.subtype = subtype;
        gr.graph_version = version;
        gr.usage = this._stringifyUsage(usage);
        gr.insert();
    },

    processGraph: function(graphJson, cs_topic_id, overwrite) {
        try {
            if (!overwrite && this._hasExistingUsageData(cs_topic_id)) return;

            if (!graphJson) return;

            var graph = JSON.parse(graphJson);

            // before adding new node data
            this._deleteExistingUsageData(cs_topic_id);

            // get the first and only goal either 'primary' or some UUID for older topics
            var goalId = Object.keys(graph.goals)[0];
            var version = graph.graph_api_version;
            var nodes = graph.goals[goalId].nodes || [];
            var variables = graph.variables;
            for (var nodeId in nodes) {
                var node = nodes[nodeId];
                var stepType = node.stepType;
                switch(stepType) {
                    case 'Start':
                        // ignore
                        break;
                    case 'TerminateGoal':
                        // ignore
                        break;
                    case 'ImplicitEnd':
                        // ignore
                        break;
                    case 'Prompt':
                        this._processPrompt(cs_topic_id, version, node, variables);
                        break;
                    case 'GroupedChoicePrompt':
                        this._processGroupedChoicePrompt(cs_topic_id, version, node);
                        break;
                    case 'TextOutput':
                        this._processTextOutput(cs_topic_id, version, node);
                        break;
                    case 'RecordOutput':
                        this._processRecordOutput(cs_topic_id, version, node);
                        break;
                    case 'ReusableTopic':
                        this._processReusableTopic(cs_topic_id, version, node);
                        break;
                    case 'CustomControl':
                        this._saveNodeData(cs_topic_id, version, node, node.reusableTopicChoice);
                        break;
                    case 'OneExtendCapability':
                        this._processOneExtendCapability(cs_topic_id, version, node);
                        break;
                    case 'SecureTextPrompt':
                        this._processSecureTextPrompt(cs_topic_id, version, node);
                        break;
                    case 'AiDataCollector':
                        this._processAIInputCollector(cs_topic_id, version, node);
                        break;
                    case 'StandaloneAITextPrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'string');
                        break;
                    case 'StandaloneAIBooleanPrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'boolean');
                        break;
                    case 'StandaloneAIChoicePrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'choice');
                        break;
                    case 'StandaloneAIDateTimePrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'datetime');
                        break;
                    case 'StandaloneAIReferenceChoicePrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'reference');
                        break;
                    case 'StandaloneAICarouselPrompt':
                        this._saveNodeData(cs_topic_id, version, node, 'carouselimage');
                        break;
                    default:
                        this._saveNodeData(cs_topic_id, version, node);
                }
            }
        } catch (e) {
            this.logger.error('Error occured while processing topic control usage for cs_topic_id: ' + cs_topic_id + ' ' + e.toString());
        }
    },

    _processPrompt: function(cs_topic_id, version, node, variables) {
        var variable = variables[node.variableId];
        var usage = {};
        var varType = '';
        if (variable.secure) {
            usage.secure = true;
        }
        if (variable.varType === 'string') {
            varType = 'string';
        }
        else if (variable.varType === 'boolean') {
            varType = 'boolean';
        }
        else if (variable.varType === 'date_time') {
            varType = 'datetime';
        }
        else if (variable.varType === 'image') {
            varType = 'image';
        }
        else if (variable.varType === 'file') {
            varType = 'file';
        }
        this._saveNodeData(cs_topic_id, version, node, varType, usage);
    },

	_processGroupedChoicePrompt: function(cs_topic_id, version, node) {
		var usage = {};
		var varType = 'array.string';
		var groups = node.groups;
		usage.multipleGroups = groups.length > 1;
		groups.forEach(function(group) {
			if (!group.isMultipleSelect) {
				usage.singleSelectGroup = true;
			}

			if (group.isMultipleSelect) {
				usage.multiSelectGroup = true;
			}

			group.choices.forEach(function(choice) {
				if (choice.meta.image.value) {
					usage.imageInChoiceItem = true;
				}
			});
		});

		usage.singleSelectGroup = usage.singleSelectGroup || false;
		usage.multiSelectGroup = usage.multiSelectGroup || false;
		usage.imageInChoiceItem = usage.imageInChoiceItem || false;
		this._saveNodeData(cs_topic_id, version, node, varType, usage);
	},


    _processTextOutput: function(cs_topic_id, version, node) {
        var usage = {};

        if (node.secure) {
            usage.secure = true;
        }
        var value = node.value.value;
        if (value) {
            findRichTextUsage(value);
        } else {
            value = node.value;
            if (value.length > 1) {
                usage.alternateMessage = true;
            }
            value.forEach(function(variation) {
                findRichTextUsage(variation.value);
            });
        }

        function findRichTextUsage(value) {
            if (value.type === 'emoji') {
                usage.emoji = true;
            }
            if (value.type === 'link') {
                usage.link = true;
            }
            if (value.type === 'bulleted-list') {
                usage.bulletedList = true;
            }
            if (value.type === 'numbered-list') {
                usage.numberedList = true;
            }
            if (value.bold) {
                usage.bold = true;
            }
            if (value.italic) {
                usage.italic = true;
            }

            if (value.children) {
                findRichTextUsage(value.children);
            }

            if (Array.isArray(value)) {
                value.forEach(function(child) {
                    findRichTextUsage(child);
                });
            }
        }
        this._saveNodeData(cs_topic_id, version, node, node.value.mode, usage);
    },

    _processRecordOutput: function(cs_topic_id, version, node) {
        this._saveNodeData(cs_topic_id, version, node, node.cardTemplate);
    },

    _processReusableTopic: function(cs_topic_id, version, node) {
          var usage = {};

          if (node.useTemplateTopic) {
             usage.dynamicTopicBlock = true;
           }

           this._saveNodeData(cs_topic_id, version, node, node.reusableTopicChoice, usage);
     },

    _getCapabilityName: function(definitionId) {
        var gr = new GlideRecord('sys_one_extend_capability_definition');
        var capabilityName = '';
        if (gr.get(definitionId))
            capabilityName = gr.capability.name.toString();

        return capabilityName;
    },

    _processOneExtendCapability: function(cs_topic_id, version, node) {
        var capabilityName = this._getCapabilityName(node.definitionId);
        this._saveNodeData(cs_topic_id, version, node, capabilityName);
    },

    _processSecureTextPrompt: function(cs_topic_id, version, node) {
        var varType = 'string';
        var usage = {};
        usage.secure = true;
        this._saveNodeData(cs_topic_id, version, node, varType, usage);
    },

    _processAIInputCollector: function(cs_topic_id, version, node) {
        var usage = {};
        usage.items = node.inputs ? node.inputs.length : 0;
        this._saveNodeData(cs_topic_id, version, node, '', usage);
    },

    type: 'TopicControlUsageUtil'
};
