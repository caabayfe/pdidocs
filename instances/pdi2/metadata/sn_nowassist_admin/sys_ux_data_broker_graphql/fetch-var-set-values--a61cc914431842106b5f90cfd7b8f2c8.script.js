(function buildQuery(query, inputs) {
    skillConfigObj = JSON.parse(inputs.skillConfigObj);
    var varSets = skillConfigObj.skill_config_var_sets;
    const deliveryStepSysId = "select-delivery";
    const defineAccessStepSysId = "define-access";
    var varSetSysIds = [];

    function fetchVarSetSysIds(varSets) {
        varSets.forEach((varSet) => {
            var varSetSysId = varSet.sysId || varSet.sys_id;
            if (varSetSysId && varSetSysId !== deliveryStepSysId && varSetSysId !== defineAccessStepSysId ) {
                varSetSysIds.push(varSetSysId);
                if (varSet.override_sets && varSet.override_sets.length > 0) {
                    fetchVarSetSysIds(varSet.override_sets);
                }
            }
        });
    }

    fetchVarSetSysIds(varSets);

    function getFormLayoutQueryData(sysId) {
        return "formLayout(\r\n" +
            "				table: \"sn_nowassist_skill_config_var_set\"\r\n" +
            "				view: \"now_assist_admin\"\r\n" +
            "				sysId: \"" + sysId + "\"\r\n" +
            "				expandGlideVars: true\r\n" +
            "				) {\r\n" +
            "				sysId\r\n" +
            "				recordValues {\r\n" +
            "					name\r\n" +
            "					value\r\n" +
            "					displayValue\r\n" +
            "					valuesList {\r\n" +
            "					value\r\n" +
            "					displayValue\r\n" +
            "					}\r\n" +
            "				}\r\n" +
            "				elementsData {\r\n" +
            "					name: elementName\r\n" +
            "					dictionary: dictionaryData {\r\n" +
            "					type: dictionaryType\r\n" +
            "					dependentFieldLabel\r\n" +
            "					dependentField\r\n" +
            "					dependentTable\r\n" +
            "					name\r\n" +
            "					label\r\n" +
            "					fieldHint\r\n" +
            "					canWrite\r\n" +
            "					canRead\r\n" +
            "					canCreate\r\n" +
            "					internalType\r\n" +
            "					isMandatory\r\n" +
            "					isEncrypted\r\n" +
            "					encryptionContext\r\n" +
            "					sys_readonly: sysReadonly\r\n" +
            "					attributes {\r\n" +
            "						name\r\n" +
            "						value\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_TemplateElementType {\r\n" +
            "					dependentField\r\n" +
            "					dependentValue\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_ChoiceElementType {\r\n" +
            "					choices {\r\n" +
            "						displayValue\r\n" +
            "						value\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_ScriptElementType {\r\n" +
            "					isXMLView\r\n" +
            "					maxLength\r\n" +
            "					recordScope\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_FileAttachmentElementType {\r\n" +
            "					value\r\n" +
            "					displayValue\r\n" +
            "					state\r\n" +
            "					contentType\r\n" +
            "					canEditName\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_TableNameElementType {\r\n" +
            "					displayValue\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_ConditionBuilderElementType {\r\n" +
            "					dependentValue\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_FieldNameElementType {\r\n" +
            "					displayValue\r\n" +
            "					dependentFieldLabel\r\n" +
            "					dependentValue\r\n" +
            "					displayValueWithPath\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_FieldListElementType {\r\n" +
            "					dependentFieldLabel\r\n" +
            "					dependentValue\r\n" +
            "					displayValuesWithPath\r\n" +
            "					displayColumnLabel\r\n" +
            "					displayColumnValue\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_SlushBucketElementType {\r\n" +
            "					slushBucketFields {\r\n" +
            "						label\r\n" +
            "						value\r\n" +
            "						selected\r\n" +
            "						order\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_CurrencyElementType {\r\n" +
            "					value\r\n" +
            "					code\r\n" +
            "					defaultCurrency\r\n" +
            "					currencyCodes {\r\n" +
            "						code\r\n" +
            "						symbol\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_PhoneNumberElementType {\r\n" +
            "					value\r\n" +
            "					country\r\n" +
            "					countryCodes {\r\n" +
            "						code\r\n" +
            "						name\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_GlideListElementType {\r\n" +
            "					reference\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_DocumentIdElementType {\r\n" +
            "					documentLabel\r\n" +
            "					dependentValue\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_ReferenceElementType {\r\n" +
            "					reference\r\n" +
            "					referenceQualifier\r\n" +
            "					referenceKey\r\n" +
            "					useReferenceQualifier\r\n" +
            "					dependent\r\n" +
            "					dependentOnField\r\n" +
            "					refAutoCompleter\r\n" +
            "					refAcOrderBy\r\n" +
            "					refAcColumns\r\n" +
            "					refAcColumnsSearch\r\n" +
            "					refAcDisplayValue\r\n" +
            "					refQualElements\r\n" +
            "					refContributions\r\n" +
            "					isDynamicCreate\r\n" +
            "					isReferenceScriptableTable\r\n" +
            "					referenceError\r\n" +
            "					referenceSysId\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_VariablesElementType {\r\n" +
            "					variables: _elements {\r\n" +
            "						... on GlideLayout_MultiRowVariableSetType {\r\n" +
            "						type\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						containerType\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						id\r\n" +
            "						maxRows\r\n" +
            "						fields {\r\n" +
            "							name\r\n" +
            "							id\r\n" +
            "							label\r\n" +
            "							type\r\n" +
            "							unique\r\n" +
            "						}\r\n" +
            "						rowData {\r\n" +
            "							row {\r\n" +
            "							id\r\n" +
            "							name\r\n" +
            "							value\r\n" +
            "							displayValue\r\n" +
            "							}\r\n" +
            "						}\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_SingleRowVariableSetType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						label\r\n" +
            "						containerType\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						variableName\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_ChoiceQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						mandatory\r\n" +
            "						readOnly\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						variableAttributes\r\n" +
            "						defaultValue\r\n" +
            "						dynamicValueField\r\n" +
            "						dynamicValueDotWalkPath\r\n" +
            "						lookupTable\r\n" +
            "						lookupValue\r\n" +
            "						lookupLabel\r\n" +
            "						includeNone\r\n" +
            "						lookupUnique\r\n" +
            "						choiceTable\r\n" +
            "						choiceField\r\n" +
            "						choiceDirection\r\n" +
            "						choices {\r\n" +
            "							displayValue: label\r\n" +
            "							value\r\n" +
            "						}\r\n" +
            "						dependentField\r\n" +
            "						dontSelectFirstOption\r\n" +
            "						referringTable\r\n" +
            "						referringRecordId\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_ReferenceQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						mandatory\r\n" +
            "						readOnly\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						reference\r\n" +
            "						referenceQual\r\n" +
            "						listTable\r\n" +
            "						useReferenceQualifier\r\n" +
            "						variableAttributes\r\n" +
            "						defaultValue\r\n" +
            "						dynamicValueField\r\n" +
            "						dynamicValueDotWalkPath\r\n" +
            "						referringTable\r\n" +
            "						referringRecordId\r\n" +
            "						refAcOrderBy\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_ContainerQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						displayTitle\r\n" +
            "						layout\r\n" +
            "						containerType\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						mandatory\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_MacroQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						mandatory\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						variableAttributes\r\n" +
            "						defaultValue\r\n" +
            "						dynamicValueField\r\n" +
            "						dynamicValueDotWalkPath\r\n" +
            "						macroponentId\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_StandardQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						mandatory\r\n" +
            "						readOnly\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						variableAttributes\r\n" +
            "						defaultValue\r\n" +
            "						dynamicValueField\r\n" +
            "						dynamicValueDotWalkPath\r\n" +
            "						exampleText\r\n" +
            "						useConfirmation\r\n" +
            "						regExp\r\n" +
            "						canDecrypt\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "						... on GlideLayout_AttachmentQuestionElementType {\r\n" +
            "						type\r\n" +
            "						id\r\n" +
            "						name\r\n" +
            "						variableName\r\n" +
            "						label\r\n" +
            "						order\r\n" +
            "						catalogItem\r\n" +
            "						variableSet\r\n" +
            "						mandatory\r\n" +
            "						readOnly\r\n" +
            "						visible\r\n" +
            "						canRead\r\n" +
            "						canWrite\r\n" +
            "						canCreate\r\n" +
            "						allowedFileExtensions\r\n" +
            "						maxAttachmentSize\r\n" +
            "						variableAttributes\r\n" +
            "						defaultValue\r\n" +
            "						contentType\r\n" +
            "						showHelp\r\n" +
            "						helpText\r\n" +
            "						instructions\r\n" +
            "						}\r\n" +
            "					}\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_ValueElementType {\r\n" +
            "					maxLength\r\n" +
            "					defaultRows\r\n" +
            "					}\r\n" +
            "					... on GlideLayout_UserImageElementType {\r\n" +
            "					value\r\n" +
            "					displayValue\r\n" +
            "					state\r\n" +
            "					contentType\r\n" +
            "					}\r\n" +
            "				}\r\n" +
            "				}\r\n" +
            "\r\n";
    }

    var formLayoutQuery = "";

    varSetSysIds.forEach(function(varSetSysId) {
        formLayoutQuery += "varset_" + varSetSysId + ": " + getFormLayoutQueryData(varSetSysId);
    });

    var glideLayoutQuery = "{\r\n" +
        "		GlideLayout_Query {\r\n" +
        formLayoutQuery +
        "		}\r\n" +
        "	}\r\n";
    query.append(glideLayoutQuery);
})(query, inputs);
