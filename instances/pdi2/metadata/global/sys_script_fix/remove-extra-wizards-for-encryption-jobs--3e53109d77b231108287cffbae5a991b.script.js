var SECRETS_MANAGEMENT_JOB_WIZARD_ANSWER_ID = '472869c753d031106cdbddeeff7b1292';
var SIGNING_JOB_WIZARD_ANSWER_ID = '87e77ef949063110ce41c8d4b027c95d';
var SYS_WIZARD_ANSWER = 'sys_wizard_answer';
var NAME = 'name';
var ANSWER = 'answer';
var SECRETS_MANAGEMENT_JOB = 'Secrets Management Job';
var SIGNING_JOB = 'Signing Job';
var DOES_NOT_EQUAL = '!=';
var SYS_ID = 'sys_id';

// delete redundant secrets management job wizard
var gr0 = new GlideRecord(SYS_WIZARD_ANSWER);
gr0.addQuery(NAME, SECRETS_MANAGEMENT_JOB);
gr0.addQuery(ANSWER, SECRETS_MANAGEMENT_JOB);
gr0.addQuery(SYS_ID, DOES_NOT_EQUAL, SECRETS_MANAGEMENT_JOB_WIZARD_ANSWER_ID);
gr0.query();
while (gr0.next()) {
    gr0.deleteRecord();
}

// delete redundant signing job wizard
var gr1 = new GlideRecord(SYS_WIZARD_ANSWER);
gr1.addQuery(NAME, SIGNING_JOB);
gr1.addQuery(ANSWER, SIGNING_JOB);
gr1.addQuery(SYS_ID, DOES_NOT_EQUAL, SIGNING_JOB_WIZARD_ANSWER_ID);
gr1.query();
while (gr1.next()) {
    gr1.deleteRecord();
}
