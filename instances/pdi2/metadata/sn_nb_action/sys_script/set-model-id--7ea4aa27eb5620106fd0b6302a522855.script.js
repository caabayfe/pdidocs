(function executeRule(current, previous /*null when async*/ ) {

    var recommended = current[sn_nb_action.Constants.COL_RECOMMENDED].getRefRecord();
    var actionTypeRecord = current[sn_nb_action.Constants.COL_ACTION_TYPE].getRefRecord();

    if (actionTypeRecord.getValue(sn_nb_action.Constants.COL_TABLE_NAME) === actionTypeRecord.getValue(sn_nb_action.Constants.COL_MODEL_TABLE))
        current[sn_nb_action.Constants.COL_MODEL_ID] = recommended.getUniqueValue();
    else {

        var dotWalkPath = actionTypeRecord.getValue(sn_nb_action.Constants.COL_MODEL_FIELD);
        var modelId = recommended.getElement(dotWalkPath);
        current[sn_nb_action.Constants.COL_MODEL_ID] = modelId;
    }

})(current, previous);
