(function refineQuery(current, parent) {
      current.addEncodedQuery("parent_id="+parent.sys_id+"^ORparent_id="+parent.related_record+"^session_id="+parent.session_id + "^sys_created_by="+parent.sys_created_by);
})(current, parent);
