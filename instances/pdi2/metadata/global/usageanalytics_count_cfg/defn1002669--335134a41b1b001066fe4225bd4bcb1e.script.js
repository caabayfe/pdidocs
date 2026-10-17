var gr = new GlideAggregate('sys_user_has_role');
gr.addQuery("roleIN282bf1fac6112285017366cb5f867469,20803f15870033000e56d61e36cb0b7d,260c203a870033000e56d61e36cb0bbc,ceb92b8153c833004558ddeeff7b12df,71cb2cf2530033004558ddeeff7b126a,d8e675e8532323008ef67c2c0fc587f6,ca27b5e8532323008ef67c2c0fc5879c,f98446040f103300402c6b198b767e1e,89d4c6040f103300402c6b198b767e3c");
gr.groupBy("user");
gr.query();
var itilUsers = [];
while (gr.next()) {
    itilUsers.push(gr.user.toString());
}

var csmUserCount = 0;
var gr2 = new GlideAggregate('sys_user_has_role');
gr2.addQuery("userIN" + itilUsers);
gr2.addQuery("roleIN3120f52cc312310015519f2974d3ae83,b2638ae3c303120095ccd02422d3ae55,041bb19487232300d6b0a7da0acb0bd7");
gr2.groupBy("user");
gr2.query();
csmUserCount = gr2.getRowCount();

answer = itilUsers.length - csmUserCount;
