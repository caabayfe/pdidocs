(function executeRule(current, previous /*null when async*/ ) {
	var result = new global.PAKPIFormUtils().unSupportedConditionFields(current.data_snapshot_source.table, current.conditions, current.data_snapshot_source);
    if (result.length === 0) return;

    var vMessage = "<ul>";
    current.setAbortAction(true);

    for (var i = 0; i < result.length; i++) {
        var unsupported_item = result[i];
        if (unsupported_item.value.length == 0) continue;

        if (unsupported_item.key == "Unsupported Operators") {
            var operatorList = [];
            var fieldList = [];

            for (var k = 0; k < unsupported_item.value.length; k++) {
                var opItem = unsupported_item.value[k];

                var operatorMatch = opItem.match(/\(([^)]+)\)/);
                if (operatorMatch) {
                    operatorList.push('"' + operatorMatch[1] + '"');
                }

                var fieldMatch = opItem.match(/^([^(]+)/);
                if (fieldMatch) {
                    var fieldName = fieldMatch[1].trim();
                    if (fieldList.indexOf(fieldName) === -1) {
                        fieldList.push(fieldName);
                    }
                }
            }

            vMessage += "<li>" +
                gs.getMessage('The condition you tried to add uses operators ({0}) that are not supported for the selected fields ({1}).',
                [operatorList.join(', '), fieldList.join(', ')]) +
                "</li>";
        } else {

            var fieldListFinal = [];
            for (var m = 0; m < unsupported_item.value.length; m++) {
                fieldListFinal.push('"' + unsupported_item.value[m] + '"');
            }

            vMessage += "<li>" +
                gs.getMessage('The condition you tried to add includes fields ({0}) that are not included in the source dimensions. These fields should be added in the source dimensions before the condition can be applied to the indicators.',
                [fieldListFinal.join(', ')]) +
                "</li>";
        }
    }

    gs.addErrorMessage(vMessage + "</ul>");
    gs.setRedirectURL(current);
    var isFormPage = GlideTransaction.get().getRequestParameter('isFormPage');
    if (!isFormPage) {
        gs.flushMessages();
    }

})(current, previous);
