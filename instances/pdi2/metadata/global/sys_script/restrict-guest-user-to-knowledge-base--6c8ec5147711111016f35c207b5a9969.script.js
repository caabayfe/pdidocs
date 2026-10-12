//User criteria for user that has atleast one role (apart from snc_internal if explicit_roles plugin is active)
var USER_CRITERIA = "user_criteria";
// User criteria knowledge base m2m tables
var CAN_READ = "kb_uc_can_read_mtom";
var CAN_CONTRIBUTE = "kb_uc_can_contribute_mtom";
var CANNOT_READ = "kb_uc_cannot_read_mtom";
var CANNOT_CONTRIBUTE = "kb_uc_cannot_contribute_mtom";

var GUEST_UC = {
    name: "Guest User",
    advanced: true,
    script: 'answer = user_id == GlideUser.getUser("guest").getID();',
    user: "5136503cc611227c0183e96598c4f706"
};

var GUEST_UC_QUERY = "sys_id=76f09af6cb1200108ad442fcf7076dbf^ORname=" + GUEST_UC.name;
var GUEST_UC_ID = findUserCriteria(GUEST_UC_QUERY);
if (gs.nil(GUEST_UC_ID)) {
    GUEST_UC_ID = createUserCriteria(GUEST_UC.name, GUEST_UC.advanced, GUEST_UC.script, GUEST_UC.user);
}

var ANY_USER_QUERY = "sys_id=fb1166d64fff0200086eeed18110c7ab^ORsys_id=c50d37ed1d285610f8776194a6ed1229^ORname=Any User";
var ANY_USER_ID = findUserCriteria(ANY_USER_QUERY);
if (gs.nil(ANY_USER_ID)) {
    ANY_USER_ID = createUserCriteria("Any User", false, null, null);
}

var HAS_A_ROLE = {
    name: "Has atleast one role apart from snc_internal KB",
    advanced: true,
    script: "var all_roles = []; \
var userHasRoleGR = new GlideRecord('sys_user_has_role'); \
userHasRoleGR.addQuery('user',user_id); \
userHasRoleGR.query(); \
while(userHasRoleGR.next()) \
all_roles.push(userHasRoleGR.getDisplayValue('role')); \
answer = GlidePluginManager.isActive('com.glide.explicit_roles') ? all_roles.includes \('snc_internal') && all_roles.length >=2:all_roles.length >=1;"
};
var HAS_A_ROLE_QUERY = "sys_id=f9397919f79d52507787d3e543bfd6cd^ORname=" + HAS_A_ROLE.name;

var HAS_A_ROLE_ID = findUserCriteria(HAS_A_ROLE_QUERY);
if (gs.nil(HAS_A_ROLE_ID)) {
    HAS_A_ROLE_ID = createUserCriteria(HAS_A_ROLE.name, HAS_A_ROLE.advanced, HAS_A_ROLE.script, null);
}


addUCtoKB(CAN_CONTRIBUTE, current.sys_id, HAS_A_ROLE_ID); //Needs to be added first to avoid unnecessary warning triggers
addUCtoKB(CANNOT_READ, current.sys_id, GUEST_UC_ID);
addUCtoKB(CANNOT_CONTRIBUTE, current.sys_id, GUEST_UC_ID);
addUCtoKB(CAN_READ, current.sys_id, ANY_USER_ID);
gs.addInfoMessage(gs.getMessage("By default knowledge base would be readable by all logged in users and contributable by users with atleast one role. Please configure user criterias to limit access."));


/**
 * Creates a user criteria record.
 * @param {string} name - The user criteria name.
 * @param {boolean} advanced - True if the user criteria is advanced, false otherwise.
 * @param {string} script - The user criteria script.
 * @param {string} user - The user criteria user.
 * @returns {string} The user criteria sys_id.
 */
function createUserCriteria(name, advanced, script, user) {
    var userCriteria = new GlideRecord(USER_CRITERIA);
    userCriteria.initialize();
    if (!gs.nil(name))
        userCriteria.setValue('name', name);
    if (advanced)
        userCriteria.setValue('advanced', true);
    if (!gs.nil(script))
        userCriteria.setValue('script', script);
    if (!gs.nil(user))
        userCriteria.setValue('user', user);
    return userCriteria.insert();
}

/**
 * 
 * @param {string} encodedQuery 
 * @returns User Criteria sys_id
 */
function findUserCriteria(encodedQuery) {
    var userCriteria = new GlideRecord('user_criteria');
    userCriteria.addEncodedQuery(encodedQuery);
    userCriteria.query();
    if (userCriteria.next())
        return userCriteria.sys_id;
    else
        return null;
}
/**
 * Adds a user criteria to a knowledge base.
 * @param {string} table - The user criteria knowledge base m2m table name.
 * @param {string} kbId - The knowledge base ID.
 * @param {string} uc - The user criteria.
 * @returns {boolean} True if the record was inserted successfully, false otherwise.
 */
function addUCtoKB(table, kbId, uc) {
    var gr = new GlideRecord(table);
    gr.kb_knowledge_base = kbId;
    gr.user_criteria = uc;
    return gr.insert();
}
