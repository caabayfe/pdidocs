(function(context) {
    context.props_details.buttonName = 'Expand';
    context.props_details.iconName = 'expand-outline';
    context.props_details.hideAccordion = true;
    context.props_details.image = '/images/ci_checklist_card_bot_accelerator.png';
    var status = new sn_oe_sfs.CIUtil().getChecklistCardStatus(context.children);
    if (status && status.total != undefined && status.remaining != undefined && status.progress_text) {
        context.badgeLabel = (status.total - status.remaining) + '/' + status.total + ' Completed';
        context.badgeColor = 'blue';
        var progress_percentage = Math.floor((status.total - status.remaining) / status.total * 100);
        context.progressText = status.progress_text;
        context.props_details.progress_percentage = progress_percentage;
        context.props_details.gauge_title = "Your VA's progress: " + progress_percentage + "%";
    }
    if (status.expandedIdx != -1) {
        context.children[status.expandedIdx].props_details.expanded = true;
        context.props_details.hideAccordion = false;
        context.props_details.buttonName = 'Collapse';
        context.props_details.iconName = 'minus-fill';
    }
    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
})(context);
