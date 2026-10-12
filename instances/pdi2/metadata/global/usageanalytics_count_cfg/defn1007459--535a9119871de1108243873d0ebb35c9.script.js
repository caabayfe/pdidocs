answer = getUserCriteriaExtensionCount();

function getUserCriteriaExtensionCount() {
    var gr = new GlideRecord('user_criteria');
    var criteriaFields = gr.getElements();
    var count = 0;
    var oobFields = {
        "role": true,
        "advanced": true,
        "company": true,
        "department": true,
        "group": true,
        "active": true,
        "script": true,
        "name": true,
        "match_all": true,
        "location": true,
        "user": true
    }

    for (var i = 0; i < criteriaFields.size(); i++) {
        var ge = criteriaFields.get(i);
        var criteriaFieldName = ge.getName();

        if (criteriaFieldName.startsWith('sys_') || oobFields[criteriaFieldName])
            continue;

        var gr = new GlideRecord('sys_user');

        if (gr.isValidField(criteriaFieldName))
            count++;
        else {
            var userFieldName = '';
            if (criteriaFieldName.startsWith('u_')) {
                userFieldName = criteriaFieldName.substring('u_'.length);
            } else {
                userFieldName = 'u_' + criteriaFieldName;
            }

            if (gr.isValidField(userFieldName))
                count++;
        }
    }
    return count;
}
