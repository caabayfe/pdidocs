(function () {
  var topicUtil = new TopicPageUtil();
  var topicServiceUtil = new sn_ex_sp.TopicServiceUtil();
  var taxonomy = String($sp.getTaxonomies());
  
  // Pagination limits
  var PAGINATION_LIMITS = {
    COMPACT: 9,
    DETAILED: 4
  };

  // Topic card style constants
  var TOPIC_CARD_STYLES = {
    DEFAULT: "default",
    COMPACT: "compact", 
    DETAILED: "detailed"
  };

  // Default card limit for single topic view and default limit for for more than one topic in detailed view and no default value is set for compact view
  var CARD_LIMITS = {
    SINGLE_TOPIC: 3,
    DETAILED_VIEW: 2
  };

  // Limit on the number of connected content to be displayed in the Detailed view on each card
  var TOPIC_CARD_CONTENT_LIMIT = 3;

  var DEFAULT_WIDGET_TITLE = gs.getMessage("Help topics");
  var QUICK_ACTIONS_WIDGET_TITLE = gs.getMessage("Quick actions");

  data.headingLevel = options.heading_level;
  data.instanceId = $sp.getDisplayValue("sys_id");
  data.widgetTitle = gs.getMessage(options.widget_title);
  data.loadConfig = options.load_config || "async";
  data.asyncLoad = (input && input.action === "loadData");
  data.topicCardStyle = options.topic_card_display_style || TOPIC_CARD_STYLES.DEFAULT;
  data.isSingleTopic = false;
  data.isCardClickable = true;
  data.cardLimit = options.card_limit;
  data.paginationLimit = PAGINATION_LIMITS.COMPACT;
  
  data.contentTypeIcons = EmployeeCenterConstants.WIDGET.HELP_CENTER_TOPICS.CONTENT_TYPE_ICONS;
  
  // Add TOPIC_CARD_STYLES constant to be access from HTML
  data.TOPIC_CARD_STYLES = TOPIC_CARD_STYLES;
  
  if (data.loadConfig === "async" && !data.asyncLoad) {
    return;
  }
  
  /**
   * Handles single topic view by fetching connected content for the topic and setting display properties
   * 
   * @param {Array} topic - Topic object
   */
  function handleSingleTopicView(topic) {
    var singleTopicCardLimit = data.cardLimit ? parseInt(data.cardLimit) : CARD_LIMITS.SINGLE_TOPIC;
    data.isSingleTopic = true;
    data.items = topicServiceUtil.getProcessedContentForHelpCenter(
      topic.sys_id, 
      singleTopicCardLimit, 
      false, 
      false, 
      [], 
      [], 
      true
    );
    data.displayLimit = data.paginationLimit;
    
    // Setting widget title to Quick actions if default title is not modified in single topic view
    data.widgetTitle = data.widgetTitle !== DEFAULT_WIDGET_TITLE ? data.widgetTitle : QUICK_ACTIONS_WIDGET_TITLE;
  }
  
  /**
   * Determines and sets the card style based on topic count or user preference
   * @param {String} topicCardStyle - Card style from widget options: "default", "compact", or "detailed"
   * @param {Array} topicsArray - Array of topic objects to determine style when topicCardStyle is "default"
   */
  function setCardStyle(topicCardStyle, topicsArray) {
    data.topicCardStyle = topicCardStyle;
    if (data.topicCardStyle === TOPIC_CARD_STYLES.DEFAULT) {
      data.topicCardStyle = topicsArray.length === 2 ? TOPIC_CARD_STYLES.DETAILED : TOPIC_CARD_STYLES.COMPACT;
    }
  }
  
  /**
   * Sets pagination limit based on card style, overriding the default for detailed view
   * @param {String} topicCardStyle - Current card style: "compact" or "detailed"
   */
  function setPaginationLimit(topicCardStyle) {
    if (topicCardStyle === TOPIC_CARD_STYLES.DETAILED) {
      data.paginationLimit = PAGINATION_LIMITS.DETAILED;
    }
  }
  
  /**
   * Determines the topic card limit based on card style and widget options
   * @param {String|Number} cardLimit - Card limit from widget options, may be string or number
   * @param {String} topicCardStyle - Current card style: "compact" or "detailed"
   * @returns {Number|null} - The resolved topic limit as a number, or null if no limit should be applied
   */
  function populateTopicCardLimit(cardLimit, topicCardStyle) {
    var topicLimit = cardLimit ? parseInt(cardLimit) : null;
    
    if (!topicLimit && topicCardStyle === TOPIC_CARD_STYLES.DETAILED) {
      topicLimit = CARD_LIMITS.DETAILED_VIEW;
    }
    return topicLimit;
  }
  
  /**
   * Fetches and attaches connected content to topics for detailed view
   * @param {String} topicCardStyle - Current card style: "compact" or "detailed"
   * @param {Array} topicsArray - Array of topic objects to fetch connected content for
   */
  function getTopicConnectedContent(topicCardStyle, topicsArray) {
    if (topicCardStyle !== TOPIC_CARD_STYLES.DETAILED) {
      return;
    }
    data.topicCardContentLimit = options.topic_card_content_limit ? parseInt(options.topic_card_content_limit) : TOPIC_CARD_CONTENT_LIMIT;
    
    for (var topicIndex = 0; topicIndex < topicsArray.length; topicIndex++) {
      var currentTopic = topicsArray[topicIndex];
      currentTopic.connectedContent = topicServiceUtil.getProcessedContentForHelpCenter(
        currentTopic.sys_id, 
        data.topicCardContentLimit, 
        false, 
        false, 
        [], 
        [], 
        true
      );
    }
    data.isCardClickable = false;
  }
  
  if (!input || input.action == "loadData") {
    var topicsArray = topicUtil.fetchHelpCenterTopics(taxonomy);
    
    if (gs.nil(topicsArray) || topicsArray.length === 0) {
      return;
    }
    
    if (topicsArray.length === 1) {
      handleSingleTopicView(topicsArray[0]);
      return;
    }
    setCardStyle(data.topicCardStyle, topicsArray);
    setPaginationLimit(data.topicCardStyle);
    var topicLimit = populateTopicCardLimit(data.cardLimit, data.topicCardStyle);
    
    if (topicLimit) {
      topicsArray = topicsArray.slice(0, topicLimit);
    }
    getTopicConnectedContent(data.topicCardStyle, topicsArray);
    
    data.items = topicsArray;
    data.displayLimit = data.paginationLimit;
  }

})();
