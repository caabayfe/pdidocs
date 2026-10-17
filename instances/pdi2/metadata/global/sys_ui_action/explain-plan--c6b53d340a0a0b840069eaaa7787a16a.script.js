var e = null;
var example = (!current.executable_sql || current.executable_sql.length == 0) ?
		current.example : current.executable_sql;
if (example.indexOf("MongoTable") > -1) {
	var table = getMongoTable(current.example);
	example = example.slice(example.indexOf("}") + 2);
	e = GlideAQueryExplanation.get(table);
} else if (current.pool_name && current.pool_name.indexOf("trino") > -1) {
    e = GlideAQueryExplanation.getForTrino();
} else {
	e = GlideAQueryExplanation.get();
}

if (e)
	current.explain_status = e.explainPlan(example, current.sys_id, null);


current.update();
action.setRedirectURL(current);

/*  Parse table from this:
 *
 *  MongoTable{fCollection=task, fDefinition=incident}
 */
function getMongoTable(example) {
	var fDefDex = example.indexOf("fDefinition");
	if (fDefDex == -1)
		return null;

	var st = fDefDex + 12;
	var end = example.indexOf("}");
	return example.slice(st, end);
}
