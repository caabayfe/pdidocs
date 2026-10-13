function transform(input) {

    var translatedStringMap = {

        //Overview
        "View key metrics to help you evaluate how VA is doing.": gs.getMessage("View key metrics to help you evaluate how VA is doing."),
        "Quicklook": gs.getMessage("Quicklook"),
        "Performance": gs.getMessage("Performance"),
        "Previous data not available": gs.getMessage("Previous data not available"),
        "No change from previous {0} day(s)": gs.getMessage("No change from previous {0} day(s)"),
        "From previous {0} day(s)": gs.getMessage("From previous {0} day(s)"),

        //Conversation
        "Conversation": gs.getMessage("Conversation"),
        "Explore insights about this conversation": gs.getMessage("Explore insights about this conversation"),
        "Details": gs.getMessage("Details"),
        "Hashed User ID": gs.getMessage("Hashed User ID"),
        "User App Index": gs.getMessage("User App Index"),
        "Start Time": gs.getMessage("Start Time"),
        "Time in App": gs.getMessage("Time in App"),
        "Channel": gs.getMessage("Channel"),
        "Conversation type": gs.getMessage("Conversation type"),
        "Language": gs.getMessage("Language"),
        "Timeline": gs.getMessage("Timeline"),
        "Mark as favorite": gs.getMessage("Mark as favorite"),
        "Remove from favorites": gs.getMessage("Remove from favorites"),
        "results": gs.getMessage("results"),
        "Anonymous": gs.getMessage("Anonymous"),

        //List Condition Builder
        "Custom": gs.getMessage("Custom"),
        "All": gs.getMessage("All"),
        "conditions": gs.getMessage("conditions"),

        //User Details
        "Back to Users": gs.getMessage("Back to Users"),
        "Hashed user ID": gs.getMessage("Hashed user ID"),
        "Explore insights about your user": gs.getMessage("Explore insights about your user"),
        "First conversation": gs.getMessage("First conversation"),
        "Last conversation": gs.getMessage("Last conversation"),
        "Time in chat": gs.getMessage("Time in chat"),
        "Languages": gs.getMessage("Languages"),
        "Channels": gs.getMessage("Channels"),
        "Conversations": gs.getMessage("Conversations"),
        "User app index": gs.getMessage("User app index"),
        "Start time": gs.getMessage("Start time"),
        "Time in app": gs.getMessage("Time in app"),
        "User": gs.getMessage("User"),
        "User ID": gs.getMessage("User ID"),

        //Category
        "Back to Overview": gs.getMessage("Back to Overview"),
        "Category": gs.getMessage("Category"),

        //Topic Details
        "Back to": gs.getMessage("Back to"),
        "Topic details": gs.getMessage("Topic details"),

        //Spoke
        "Back to topics": gs.getMessage("Back to topics"),
        "spoke usage": gs.getMessage("spoke usage"),
        "Spoke": gs.getMessage("Spoke"),

        //Custom Events
        "View metrics from custom events.": gs.getMessage("View metrics from custom events."),
        "Select an Event": gs.getMessage("Select an Event"),

        //Issue Auto Resolution
        "Issue auto-resolution details": gs.getMessage("Issue auto-resolution details"),

        //Funnel Details
        "Back to Funnels": gs.getMessage("Back to Funnels"),
        "Funnel data": gs.getMessage("Funnel data"),
        "Funnel details": gs.getMessage("Funnel details"),
        "Funnel: {0}": gs.getMessage("Funnel: {0}"),
        "All the users made it through the steps": gs.getMessage("All the users made it through the steps"),
        "{0}% of users drop off": gs.getMessage("{0}% of users drop off"),
        "{0} users": gs.getMessage("{0} users"),
        "Delete Funnel": gs.getMessage("Delete Funnel"),
        "Are you sure you want to drop this funnel?": gs.getMessage("Are you sure you want to drop this funnel?"),
        "Cancel": gs.getMessage("Cancel"),
        "Delete": gs.getMessage("Delete"),
        "Step {0}": gs.getMessage("Step {0}"),

        //Funnel Builder
        "Create a new funnel": gs.getMessage("Create a new funnel"),
        "Identify a sequence of steps in a conversation path to determine if it's effective for your users. We'll use data from the last month to generate metrics on this funnel's performance": gs.getMessage("Identify a sequence of steps in a conversation path to determine if it's effective for your users. We'll use data from the last month to generate metrics on this funnel's performance"),
        "Add specific details of whats happening at each step in the funnel": gs.getMessage("Add specific details of whats happening at each step in the funnel"),
        "Edit a funnel": gs.getMessage("Edit a funnel"),
        "Make changes to the steps in the conversation path below to edit this funnel.": gs.getMessage("Make changes to the steps in the conversation path below to edit this funnel."),
        "Adjust the details of what's happening at each step in the funnel": gs.getMessage("Adjust the details of what's happening at each step in the funnel"),
        "Create funnel": gs.getMessage("Create funnel"),
        "Save changes": gs.getMessage("Save changes"),
        "Unsaved funnel details": gs.getMessage("Unsaved funnel details"),
        "The details of your funnel will not be saved, are you sure you want to go back?": gs.getMessage("The details of your funnel will not be saved, are you sure you want to go back?"),
        "Continue": gs.getMessage("Continue"),
        "A funnel with the same name already exists. Enter a different name and try again.": gs.getMessage("A funnel with the same name already exists. Enter a different name and try again."),
        "There was an error due to duplicate conditions. Remove identical conditions at Step {0} & Step {1} and try again.": gs.getMessage("There was an error due to duplicate conditions. Remove identical conditions at Step {0} & Step {1} and try again.")
    };

    var resultData = input.data || {};
    var translatedString = {};
    var keys = Object.keys(resultData);
    keys.forEach(function(key) {
        translatedString[key] = translatedStringMap[resultData[key]] || resultData[key];
    });
    return translatedString;
}
