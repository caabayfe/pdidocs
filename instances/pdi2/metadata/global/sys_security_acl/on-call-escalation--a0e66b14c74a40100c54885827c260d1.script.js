var arrayUtil = new ArrayUtil();

answer = gs.hasRole("sn_on_call_admin") || current.source.getRefRecord().canRead() || (arrayUtil.contains(new OnCallCommonSNC().getUserGroups(), current.group) && new OCCalendarUtils().canRead());
