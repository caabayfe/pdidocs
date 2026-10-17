function transform() {
    var result = {};

    function getNumberOfActiveTopics() {
        var _count = 0;
        if (GlidePluginManager.isActive("com.glide.cs.chatbot") || GlidePluginManager.isActive("com.glide.cs.chatbot.lite")) {
            var gr = new GlideAggregate('sys_cs_topic');
            gr.addQuery("is_system_topic", false);
            gr.addQuery("type", "!=", "TOPIC_BLOCK");
            gr.addQuery("type", "!=", "SETUP_TOPIC");
            gr.addQuery("active", true);
            gr.addAggregate("COUNT");
            gr.query();
            _count = gr.next() ? gr.getAggregate('COUNT') : 0;
        }
        return _count;
    }

    var queAndAnsData = [{
        "Question": gs.getMessage("How do you currently handle incoming user requests?"),
        "Answer": gs.getMessage("Perhaps customer service reps field support requests on the phone or through email. You might also have a system in place to track the resolution of these issues. Whatever the case, reviewing your customer or employee support infrastructure will make the transition to a conversational platform as seamless as possible.")
    }, {
        "Question": gs.getMessage("What type of agents do you want to handle these requests?"),
        "Answer": gs.getMessage("Both bots and live agents can work together to offer a best-in-class user support experience. Bots are effective at resolving the most frequent questions and requests. With these common issues out of the way, your live agents will be freed up to tackle the more complicated user needs.")
    }, {
        "Question": gs.getMessage("Where do you want to offer support to your users?"),
        "Answer": gs.getMessage("Your bot and live agents can meet users right where they are—for example, in an employee portal or a third-party messaging app, like Microsoft Teams. Consider which channels are utilized most frequently in your organization, so your users won’t have to go far to get the help they need.")
    }, {
        "Question": gs.getMessage("What types of information do you have to support users?"),
        "Answer": gs.getMessage("Depending on the issue or request, users will need different types of information. For example, they may need a status update on a ticket, a relevant article from your community forum, in-depth guidance on ordering an item, and more. The scope of knowledge your organization provides will significantly impact your chat support experience.")
    }, {
        "Question": gs.getMessage("What are your bot goals?"),
        "Answer": gs.getMessage("So, you’re aware that bots can reduce costs, deflect common requests, and offer off-hours support. But what exactly are you hoping a bot will achieve for your organization? Spend some time defining the chat performance metrics for your unique use case, so that you can craft your bot with purpose.")
    }, ];

    var active_topics_count = getNumberOfActiveTopics();
    var topics_msg = GlidePluginManager.isActive("com.glide.cs.chatbot") ? active_topics_count != "0" ? gs.getMessage("{0} active topics", [active_topics_count]) : gs.getMessage("View pre-built topics") : gs.getMessage("View your bot's topics");

    result["topics_msg"] = topics_msg;
    result["que_and_ans"] = queAndAnsData;
    result["see_more"] = gs.getMessage("See more");
    result["show_less"] = gs.getMessage("Show less");
    result["try_your_bot"] = gs.getMessage("Test your bot");
    result["installation_successful"] = gs.getMessage("Installation successful!.");
    result["installation_failed"] = gs.getMessage("Install Failed!");
    result["installation_failed_suffix"] = gs.getMessage("Your installation could not complete.");

    result["isChatbotInstalled"] = GlidePluginManager.isActive("com.glide.cs.chatbot");
    result["installation_conflict_msg"] = gs.getMessage('Application installation is unavailable because another operation is running');
    result["installation_warning_message"] = gs.getMessage('Something went wrong while tracking the progress. Please check the status');
    result["here"] = gs.getMessage('here');
    result["remaining"] = gs.getMessage('remaining');
    result["achieved"] = gs.getMessage('Achieved');
    result["good_start"] = gs.getMessage('Off to a good start');
    result["keep_it_up"] = gs.getMessage('Let\'s keep it up!');
    result["almost_there"] = gs.getMessage('Almost there!');
    result["your_a_machine"] = gs.getMessage('Your a machine!');
    result["completed"] = gs.getMessage(' Completed');
    result['build_now_assist'] = gs.getMessage('Build a Virtual Agent with Now Assist');
    result['create_now_assist'] = gs.getMessage('Create a new Virtual Agent that uses Now Assist skills.');
    result['guided_setup_turned_on'] = gs.getMessage('Now Assist in Virtual Agent is active');
    result['guided_setup_turned_off'] = gs.getMessage('Now Assist in Virtual Agent is inactive');
    result['guided_setup_turned_on_button'] = gs.getMessage('Manage');
    result['guided_setup_turned_off_button'] = gs.getMessage('Turn on');

    return result;
}
