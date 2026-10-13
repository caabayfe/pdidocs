if (current.sys_id.nil()) {
   answer= true;
} else {
   answer=new OnCallSecurityNG().rotaMgrAccess(current.roster.rota.group);
}
