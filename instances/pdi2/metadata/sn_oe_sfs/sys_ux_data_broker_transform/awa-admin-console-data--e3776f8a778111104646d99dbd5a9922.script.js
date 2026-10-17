function transform() {
    var result = {};

    var queAndAnsData = [{
        "Question": gs.getMessage("What kind of queues would work best for your team?"),
        "Answer": gs.getMessage("A queue is a collection of work items waiting to be assigned to an agent, and you get to decide how those work items are grouped. Perhaps your team’s work items would be best organized by department, customer type, or an agent’s skillset. Whatever the case, take some time to strategize around which queues would best serve your agents and your users.")
    }, {
        "Question": gs.getMessage("How will you define your assignment groups?"),
        "Answer": gs.getMessage("Like queues, assignment groups can be fully customized to fit the needs of your org. In the case of assignment groups, however, you’ll be categorizing agents based on their skillset. For example, you might have a group of expert-level agents who are available from 9am-5pm during the workweek, and another group of agents who can provide basic support outside of regular business hours.")
    }, {
        "Question": gs.getMessage("What skills does your team have?"),
        "Answer": gs.getMessage("A skill is just a parameter—usually a language or a level of product expertise—used to automatically assign a work item to the right agent. You might want to survey your agents to get a sense of what skills they have. The more you know about your support team’s skillset, the better support you’ll be able to provide.")
    }, {
        "Question": gs.getMessage("Which skills will be optional, and which will be mandatory?"),
        "Answer": gs.getMessage("Mandatory skills are nonnegotiable for users. For example, a Spanish-speaking user absolutely needs an agent who speaks Spanish. Optional skills, on the other hand, are certainly helpful, but not as critical. Be sure to configure a skill-based routing approach that honors your users’ must-haves while still accounting for the skills that will make for a superior support experience.")
    }, {
        "Question": gs.getMessage("How could your key performance indicators (KPIs) impact your queues?"),
        "Answer": gs.getMessage("For example, you might have a service-level agreement (SLA) that entitles certain users to a higher standard of support. With dedicated VIP queues and assignment groups, you can meet your SLAs and exceed your KPIs.")
    }];

    result["que_and_ans"] = queAndAnsData;
    result["isAwaInstalled"] = GlidePluginManager.isActive("com.glide.awa");

    return result;
}
