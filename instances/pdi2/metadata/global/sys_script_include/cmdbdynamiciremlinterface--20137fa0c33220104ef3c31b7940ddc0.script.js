var CMDBDynamicIREMLInterface = Class.create();
CMDBDynamicIREMLInterface.prototype = {

    _CMDB_DYNAMIC_IRE_MATCH: "cmdb_dynamic_ire_match",
    _CMDB_DYNAMIC_IRE_FEATURE_SET: "cmdb_dynamic_ire_feature_set",
    _LOG_PROPERTY: "glide.identification_engine.ire_dynamic.log.level",
    _ML_SOLUTION: "ml_solution",
    _SOLUTION_NAME: "solution_name",
    _ML_MODEL_ARTIFACT: "ml_model_artifact",
    _TABLE_REF_SOLUTION: "solution",
    _MODEL_ID: "model_id",
    _DOT: ".",
    _TEXTNODE: '#text',
    _VERSION: "version",
    _ACTIVE: "active",
    _SYS_CREATED_ON: 'sys_created_on',
    _XML_TAG_SOLUTION_NAME: "solutionName",
    _XML_TAG_ALIAS_NAMES: "actualColumnNameToAliasColumnName",
    _XML_TAG_CLASSIFIER: "m__Classifier",
    _XML_TAG_NOMINAL_TO_BINARY: "m__NominalToBinary",
    _XML_TAG_OUTPUT_FORMAT: "m__OutputFormat",
    _XML_TAG_ATTRIBTUES: "m__Attributes",
    _XML_TAG_TYPE: "m__Type",
    _XML_TAG_NAME: "m__Name",
    _XML_TAG_INDEX: "m__Index",
    _XML_TAG_MODEL_WIGHTS: "w",
    _XML_TAG_ALIAS_CLASS_VALUE_TO_ACTUAL_VALUE: "aliasClassValueToActualClassValue",
    _XML_TAG_LABEL: "label",
    _XML_TAG_ATTRIBUTE_INFO: "m__AttributeInfo",
    _XML_TAG_HASH_TABLE: "m__Hashtable",
    _XML_TAG_STRING: "string",
    _XML_TAG_INT: "int",
    _XML_TAG_BIAS_CLASS_AND_PROBABILITY: "biasClassAndProbability",
    _BIAS: "bias",
    _NO_MATCH: "0",
    _MATCH: "1",

    initialize: function(logProperty) {

        if (JSUtil.nil(logProperty))
            logProperty = this._LOG_PROPERTY;

        this.log = new GSLog(logProperty, this.type);
    },

    /*
     * Return the model metadate of the trained model
     * @param mlSolutionName the soution for which the weights are required
     * @return weights {status: "SUCCESS", weights: "{["feature_name":"weight"]}"}
     */

    getModelMetaData: function(mlSolutionName) {
        var result = {};
        this._invalid.mlSolutionName = mlSolutionName;
        this._invalid.result = result;
        this._invalid.message = 'There was an issue while loading the model file from the ML platform tables for solution {0} and soutionVersion {1}';
        this._invalid.log = this.log;

        result.status = "SUCCESS";
        try {

            var gr = new GlideRecord(this._ML_SOLUTION);
            gr.addQuery(this._SOLUTION_NAME, mlSolutionName);
            gr.query();
            if (!gr.next()) {
                result.status = "FAILURE";
                result.statusCode = "solution_unavailable";
                return JSON.stringify(result);
            }

            this.log.logInfo('CMDBDynamicIREMLInterface::getModelMetaData The solution: ' + mlSolutionName + ' is available, successfully found.');
            var solutionSysId = gr.getUniqueValue();

            var modelFeatureNamesXML = this._getArtifactStream(solutionSysId, '0.gz');
            if (this._invalid.node(modelFeatureNamesXML, 'model_features_xml_was_null'))
                return JSON.stringify(this._invalid.result);

            this.log.logInfo('CMDBDynamicIREMLInterface::getModelMetaData The modelFeatures XML was successfully loaded: ' + modelFeatureNamesXML);

            var weightsXML = this._getArtifactStream(solutionSysId, mlSolutionName + '.gz');
            if (this._invalid.node(weightsXML, 'model_features_weights_xml_was_null'))
                return JSON.stringify(this._invalid.result);

            this.log.logInfo('CMDBDynamicIREMLInterface::getModelMetaData The modelFeatureWeights XML was successfully loaded: ' + weightsXML);

            var weightsResponse = this._extractWeightsFromModelFiles(mlSolutionName, modelFeatureNamesXML, weightsXML);
            //if (this._invalid.node(weightsResponse, 'model_features_weights_extraction_failed'))
            if (weightsResponse == null)
                return JSON.stringify(this._invalid.result);

            //check if the  status is Failure and update the main result response object
            if (this._invalid_condition(weightsResponse.status == 'FAILURE', weightsResponse.statusCode))
                return JSON.stringify(this._invalid.result);

            if (weightsResponse.status == 'SUCCESS')
                result.weights = weightsResponse;

        } catch (ex) {
            result.status = 'EXCEPTION';
            this.log.logErr('CMDBDynamicIREMLInterface::getModelMetaData msg: ' + ex);
        }

        return JSON.stringify(result);
    },

    _invalid: {
        mlSolutionName: '',
        result: {},
        message: '',
        log: {},
        _log: function(code) {
            this.result.status = 'FAILURE';
            this.result.statusCode = code;
            this.log.logErr(this.formatMessage(this.message, [this.mlSolutionName, code]));
        },
        iterator: function(iterator, code) {
            return this.condition(gs.nil(iterator) || !iterator.hasNext(), code);
        },
        node: function(node, code) {
            return this.condition(gs.nil(node), code);
        },
        condition: function(condition, code) {
            if (condition) {
                this._log(code);
                return true;
            }
            return false;
        },
        formatMessage: function(str, args) {
            this._replaceExpr = this._replaceExpr || [];

            for (var i = 0; i < args.length; i++) {
                if (i >= this._replaceExpr.length)
                    this._replaceExpr[i] = new RegExp('\\{' + i + '\\}', 'gi');

                str = str.replace(this._replaceExpr[i], args[i]);
            }
            return str;
        },
    },
	
    /*
    	@param mlSolutionName : The solution Name of the model
    	@param modelFeatureNamesXML : featureNames XML
    	@param weightsXML: the weights XML
     */
    _extractWeightsFromModelFiles: function(mlSolutionName, modelFeatureNamesStream, weightsStream) {
        var weights = {};
        this._invalid.mlSolutionName = mlSolutionName;
        this._invalid.result = weights;
        this._invalid.message = 'There was an issue while loading the model weights from the ML platform tables. {0}, error {1}';
        this._invalid.log = this.log;

        try {

            var featuresDoc = sn_cmdb.DynamicIREScriptableAPI.getScopedXMLDocument2(modelFeatureNamesStream);
            var root = featuresDoc.getDocumentElement().getNodeName();

            var solutionNameTag = featuresDoc.getFirstNode('/' + root + '/' + this._XML_TAG_SOLUTION_NAME);
            if (this._invalid.node(solutionNameTag, 'solution_name_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                return null;

            var solutionName = solutionNameTag.getTextContent();
            if (this._invalid.condition(solutionName != mlSolutionName, 'solution_name_passed_does_not_match_with_model_meta_data'))
                return null;

            var aliasTag = featuresDoc.getFirstNode('/' + root + '/' + this._XML_TAG_ALIAS_NAMES);
            if (this._invalid.node(aliasTag, 'alias_name_tag_not_present_check_with_ml_platform'))
                return null;

            var aliasTagChildren = aliasTag.getChildNodeIterator();
            if (this._invalid.iterator(aliasTagChildren, 'alias_name_tag_does_not_have_children_check_with_ml_platform'))
                return null;

            var columnMap = {};
            var aliasTagChildNode = null;
            var stringNodes = null;
            var i = 0;
            while (aliasTagChildren.hasNext() && (aliasTagChildNode = aliasTagChildren.next()) != null) {
                if (this._invalid.node(aliasTagChildNode, 'entry_tag_does_not_exists_for_item ' + (i + 1) + '_check_with_ml_platform'))
                    return null;

                if (aliasTagChildNode.getNodeName() == this._TEXTNODE)
                    continue;
                i++;

                stringNodes = aliasTagChildNode.getChildNodeIterator();
                if (this._invalid.iterator(stringNodes, 'entry_tag_does_not_have_children_for_item' + i + '_check_with_ml_platform'))
                    return null;

                var item0, item1;
                while (stringNodes.hasNext() && (item0 = stringNodes.next()) != null && item0.getNodeName() == this._TEXTNODE);
                while (stringNodes.hasNext() && (item1 = stringNodes.next()) != null && item1.getNodeName() == this._TEXTNODE);
                if (this._invalid.condition((gs.nil(item0) || gs.nil(item1) ||
                        gs.nil(item0.getTextContent()) || gs.nil(item1.getTextContent()) ||
                        item0.getTextContent().trim() == '' || item1.getTextContent().trim() == ''), 'string_tag_does_not_have_value_for_item_check_with_ml_platform'))
                    return null;

                columnMap[item1.getTextContent()] = item0.getTextContent();
            }


            var weightsDoc = new sn_cmdb.DynamicIREScriptableAPI.getScopedXMLDocument2(weightsStream);
            root = weightsDoc.getDocumentElement().getNodeName();
            var xpath = '/' + root + '/wekaClassifier/' + this._XML_TAG_CLASSIFIER + '/' + this._XML_TAG_CLASSIFIER + '/' + this._XML_TAG_CLASSIFIER;

            var labelTag = weightsDoc.getFirstNode(xpath + '/m__Model/' + this._XML_TAG_LABEL);
            if (this._invalid.node(labelTag, 'label_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                return null;

            var intNodesOflabelTag = labelTag.getChildNodeIterator();
            if (this._invalid.iterator(intNodesOflabelTag, 'label_tag_does_not_have_children_check_with_ml_platform'))
                return null;

            var labelTagIntNode = null;
            var count = 0;
            while (intNodesOflabelTag.hasNext() && (labelTagIntNode = intNodesOflabelTag.next()) != null) {
                if (labelTagIntNode.getNodeName() == this._TEXTNODE)
                    continue;

                columnMap['label_index_' + count] = labelTagIntNode.getTextContent();
                count++;
            }

            var attributesTag = weightsDoc.getFirstNode(xpath + '/' + this._XML_TAG_NOMINAL_TO_BINARY + '/' + this._XML_TAG_OUTPUT_FORMAT + '/' + this._XML_TAG_ATTRIBTUES);
            if (this._invalid.node(attributesTag, 'm__Attributes_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                return null;

            var wekaAttributeList = attributesTag.getChildNodeIterator();
            if (this._invalid.iterator(wekaAttributeList, 'm__Attributes_tag_does_not_have_children_weka.core.Attribute_missing_check_with_ml_platform'))
                return null;

            var indexToFeatureNameMap = {},
                wekaAttribute;
            while (wekaAttributeList.hasNext() && (wekaAttribute = wekaAttributeList.next()) != null) {

                if (wekaAttribute.getNodeName() == this._TEXTNODE)
                    continue;

                var wekaAttributeChildren = wekaAttribute.getChildNodeIterator();
                if (gs.nil(wekaAttributeChildren) || !wekaAttributeChildren.hasNext())
                    continue;

                var wekaAttributeChild, childData = {};
                while (wekaAttributeChildren.hasNext() && (wekaAttributeChild = wekaAttributeChildren.next()) != null) {

                    if (wekaAttributeChild.getNodeName() == this._TEXTNODE)
                        continue;

                    if (wekaAttributeChild.getNodeName() == this._XML_TAG_ATTRIBUTE_INFO) {
                        childData[this._XML_TAG_ATTRIBUTE_INFO] = true;

                        var attributeInfoChildren = wekaAttributeChild.getChildNodeIterator();
                        if (this._invalid.iterator(attributeInfoChildren, 'm__AttributeInfo_tag_does_not_have_children_check_with_ml_platform'))
                            return null;

                        var hashtableTag;
                        while (attributeInfoChildren.hasNext() && (hashtableTag = attributeInfoChildren.next()).getNodeName() != this._XML_TAG_HASH_TABLE);
                        if (this._invalid.condition(hashtableTag.getNodeName() != this._XML_TAG_HASH_TABLE, 'm__Hashtable_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                            return null;

                        var hashtableEntries = hashtableTag.getChildNodeIterator();
                        if (this._invalid.iterator(hashtableEntries, 'm__Hashtable_tag_does_not_have_children_check_with_ml_platform'))
                            return null;

                        var entryNode, entry = {};
                        while (hashtableEntries.hasNext() && (entryNode = hashtableEntries.next()) != null) {
                            if (entryNode.getNodeName() == this._TEXTNODE)
                                continue;

                            var entryChildren = entryNode.getChildNodeIterator(),
                                entryChild;
                            while (!gs.nil(entryChildren) && entryChildren.hasNext() && (entryChild = entryChildren.next()) != null) {
                                if (entryChild.getNodeName() == this._TEXTNODE)
                                    continue;

                                entry[entryChild.getNodeName()] = entryChild.getTextContent();
                            }

                            if (this._invalid.condition(Object.keys(entry).length != 2, 'm__Hashtable_tag_does_not_have_2_children_check_with_ml_platform'))
                                return null;

                            columnMap[entry[this._XML_TAG_STRING]] = columnMap["label_index_" + entry[this._XML_TAG_INT]];
                        }

                    } else
                        childData[wekaAttributeChild.getNodeName()] = wekaAttributeChild.getTextContent();

                }

                if (!childData[this._XML_TAG_ATTRIBUTE_INFO] && childData[this._XML_TAG_TYPE] == '0')
                    indexToFeatureNameMap[childData[this._XML_TAG_INDEX]] = columnMap[childData[this._XML_TAG_NAME]];
                else {
                    if (this._invalid.condition(!childData[this._XML_TAG_ATTRIBUTE_INFO], 'm__AttributeInfo_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                        return null;

                    indexToFeatureNameMap[childData[this._XML_TAG_INDEX]] = 'outputLabel';
                }
            }



            var model = weightsDoc.getFirstNode(xpath + '/m__Model/' + this._XML_TAG_MODEL_WIGHTS);
            if (this._invalid.node(model, 'w_tag_not_present_check_with_ml_platform_team_if_version_has_changed'))
                return null;

            var weightsList = model.getChildNodeIterator();
            if (this._invalid.iterator(weightsList, 'w_tag_does_not_have_children_check_with_ml_platform_if_version_has_changed'))
                return null;

            var weight, featurecount = 0,
                lastWeight;
            while (weightsList.hasNext() && (weight = weightsList.next()) != null) {
                if (weight.getNodeName() == this._TEXTNODE)
                    continue;

                var feature = indexToFeatureNameMap[featurecount++];
                if (!gs.nil(feature) && feature != 'outputLabel')
                    weights[feature] = weight.getTextContent();

                lastWeight = weight.getTextContent();
            }
            weights.feature_count = featurecount;


            var biasClassAndProbabilityTag = weightsDoc.getFirstNode('/' + root + '/trainerResult/' + this._XML_TAG_BIAS_CLASS_AND_PROBABILITY);
            if (this._invalid.node(biasClassAndProbabilityTag, 'biasClassAndProbabiity_not_present_check_with_ml_platform_team_if_version_has_changed'))
                return null;

            var biasClassAndProbabilityTagChildren = biasClassAndProbabilityTag.getChildNodeIterator();
            if (this._invalid.iterator(biasClassAndProbabilityTagChildren, 'biasClassAndProbabiity_tag_does_not_have_children_check_with_ml_platform_if_version_has_changed'))
                return null;

            var biasClassAndProbability;
            while (biasClassAndProbabilityTagChildren.hasNext() && (biasClassAndProbability = biasClassAndProbabilityTagChildren.next()) != null) {
                if (biasClassAndProbability.getNodeName() != this._TEXTNODE)
                    break;
            }

            if (this._invalid.condition(gs.nil(biasClassAndProbability) || biasClassAndProbability.getNodeName() != 'entry', 'biasClassAndProbabiity_tag_first_child_null_check_with_ml_platform_if_version_has_changed'))
                return null;

            var biasClassAndProbabilityEntries = biasClassAndProbability.getChildNodeIterator();
            if (this._invalid.iterator(biasClassAndProbabilityEntries, 'biasClassAndProbabiity_tag_first_child_null_check_with_ml_platform_if_version_has_changed'))
                return null;

            var biasClass;
            while (biasClassAndProbabilityEntries.hasNext() && (biasClass = biasClassAndProbabilityEntries.next()) != null) {
                if (biasClass.getNodeName() != this._TEXTNODE)
                    break;
            }
            var noMatchRecords = this._getRecordCount(this._NO_MATCH);
            var matchRecords = this._getRecordCount(this._MATCH);
            var biasClassLableFromData = matchRecords > noMatchRecords ? this._MATCH : this._NO_MATCH;

            if ("class0".equalsIgnoreCase(biasClass.getTextContent())) {
                //bias class is class0
                if (this._MATCH == biasClassLableFromData) {
                    //class0 = 1 from labels
                    if (this._MATCH == columnMap["class0"]) {
                        //weka class0 is 1 in ARFF format
                        //class0 = 1 from labels
                        weights["rev"] = "false";
                    } else if (this._NO_MATCH == columnMap["class0"]) {
                        //class = 0 from weka
                        weights["rev"] = "true";
                    } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                        return null;
                } else if (this._NO_MATCH == biasClassLableFromData) {
                    //class0 = 0 from labels
                    if (this._MATCH == columnMap["class0"]) {
                        //weka class0 is 1 in ARFF format
                        //class0 = 0 from labels
                        weights["rev"] = "true";
                    } else if (this._NO_MATCH == columnMap["class0"]) {
                        //class = 0 from weka
                        weights["rev"] = "false";
                    } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                        return null;
                } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                    return null;
            } else if ("class1" == biasClass.getTextContent()) {
                //bias class is class1
                if (this._MATCH == biasClassLableFromData) {
                    //class1 = 1 from labels
                    if (this._MATCH == columnMap["class1"]) {
                        //class1 = 1 from weka
                        weights["rev"] = "false";
                    } else if (this._NO_MATCH == columnMap["class1"]) {
                        //class1=0 from weka
                        weights["rev"] = "true";
                    } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                        return null;
                } else if (this._NO_MATCH == biasClassLableFromData) {
                    //class1 = 0 from labels
                    if (this._MATCH == columnMap["class1"]) {
                        //class1 = 1 from weka
                        weights["rev"] = "true";
                    } else if (this._NO_MATCH == columnMap["class1"]) {
                        //class1=0 from weka
                        weights["rev"] = "false";
                    } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                        return null;
                } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                    return null;
            } else if (this._invalid.condition(true, 'There_cannot_be_more_than_2_classes'))
                return null;

            weights[this._BIAS] = lastWeight;
            weights.status = "SUCCESS";

        } catch (ex) {
            this._invalid.condition(true, 'UNHANDLED EXCEPTION');
        }

        return weights;
    },

    _getRecordCount: function(label) {
        var gr = new GlideAggregate(this._CMDB_DYNAMIC_IRE_FEATURE_SET);
        gr.addQuery('label', label);
        gr.addAggregate('COUNT');
        gr.query();
        return gr.next()? gr.getAggregate('COUNT') : 0;
    },


    /**
     * Helper method to fetch the modelXML from the
     * ml platform tables
     * @param the sysId of the solution.
     * @param the version of the solution.
     * @return XML string of the model.
     */
    _getArtifactStream: function(solutionSysId, id) {
        var model = new GlideRecord(this._ML_MODEL_ARTIFACT);
        model.addQuery(this._TABLE_REF_SOLUTION, solutionSysId);
        model.addQuery(this._MODEL_ID, id);
        model.addQuery(this._TABLE_REF_SOLUTION + this._DOT + this._ACTIVE, 'true');
        model.orderByDesc(this._TABLE_REF_SOLUTION + this._DOT + this._SYS_CREATED_ON);

        model.query();
        if (!model.next())
            return null;

        var attachment = new GlideSysAttachment();
        var agr = attachment.getAttachments(this._ML_MODEL_ARTIFACT, model.getUniqueValue());
        if (!agr.next())
            return null;

        return sn_cmdb.DynamicIREScriptableAPI.getDecompressedAttachmentStream(agr.getUniqueValue());
    },

    type: 'CMDBDynamicIREMLInterface'
};
