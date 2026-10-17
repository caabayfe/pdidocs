if (current.primary_known_error_article) {
    var problemSysId = current.sys_id;
    var problemNumber = current.number;

    var incidentGR = new GlideRecord('incident');
    incidentGR.addQuery('problem_id', problemSysId);
    incidentGR.query();

    while (incidentGR.next()) {
        var problemUrl = '<a href="' + gs.getProperty('glide.servlet.uri') + 'problem.do?sys_id=' + problemSysId + '">' + problemNumber + '</a>';
        var knownArticleURL = '<a href="' + gs.getProperty('glide.servlet.uri') + 'kb_template_known_error_article.do?sys_id=' + current.primary_known_error_article.sys_id + '">' + current.primary_known_error_article.getDisplayValue() + '</a>';
        var message = 'Known Error article created against ' + problemUrl + ': ' + knownArticleURL;
        incidentGR.work_notes = '[code]' + message + '[/code]';
        incidentGR.update();
    }
}
