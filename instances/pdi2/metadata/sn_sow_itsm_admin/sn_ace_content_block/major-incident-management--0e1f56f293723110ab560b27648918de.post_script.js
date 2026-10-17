(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    const MIMAdminExpRoutes = ['assign-major-incident-manager-role', 'configure-mi-trigger-rules', 'mi-trigger-rule', 'timeline-configurations', 'mim-playbook', 'major-incident-management'];

    if (pageParams && pageParams.route && MIMAdminExpRoutes.indexOf(pageParams.route.toString()) != -1) {
        context.props_details.endpoint = pageParams.route.toString();
    }

})(context, pageParams);
