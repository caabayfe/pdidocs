(function(engine) {
    //avoid the skip tables
    var skip_tables = ["sys_script_execution_history"];
    if (skip_tables.indexOf(engine.current.getTableName()) > -1)
        return;

    //check glide encrypter usage at least once
    var search_regex = /new\s*GlideEncrypter\s*\(/;
    if (!search_regex.test(engine.columnValue))
        return;

    //remove code comments
    var code_comments_regex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;
    var commentsRemovedValue = engine.columnValue.replace(code_comments_regex, '');

    //raise finding if no comments found or usage found in commentsRemovedValue
    if (commentsRemovedValue.length == engine.columnValue.length || search_regex.test(commentsRemovedValue))
        engine.finding.increment();

})(engine);
