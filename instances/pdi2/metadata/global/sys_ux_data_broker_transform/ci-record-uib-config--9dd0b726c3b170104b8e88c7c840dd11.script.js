function transform(input) {
  var output = null;
  try {
    if (!input || !input.table || !input.sys_id || !input.pre_fetch_user_values) return output;
    output = new CIRecordPagePropsUtil().getFields(input.table, input.sys_id, input.pre_fetch_user_values);
    return output;
  } catch (e) {
    return output;
  }
}
