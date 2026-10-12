/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const HEALTH_SCORE_CONFIG = {
    ranges: {
      severe: { min: 0, max: 25 },
      poor: { min: 26, max: 50 },
      fair: { min: 51, max: 75 },
      good: { min: 76, max: 99 },
      perfect: { value: 100 }
    },
    messages: {
      severe: "Immediate attention required",
      poor: "Multiple improvements needed",
      fair: "Good health with areas to improve",
      good: "Good health with minor improvements",
      perfect: "Great knowledge base health"
    }
  };

  const { ranges, messages } = HEALTH_SCORE_CONFIG;

  var score = api.data?.fetch_knowledgebase_healthscores_data_1.output?.knowledgeBaseHealth?.score;
  if (score >= ranges.severe.min && score <= ranges.severe.max) {
    return helpers.translateSync(messages.severe);
  } else if (score >= ranges.poor.min && score <= ranges.poor.max) {
    return helpers.translateSync(messages.poor);
  } else if (score >= ranges.fair.min && score <= ranges.fair.max) {
    return helpers.translateSync(messages.fair);
  } else if (score >= ranges.good.min && score <= ranges.good.max) {
    return helpers.translateSync(messages.good);
  } else if (score === ranges.perfect.value) {
    return helpers.translateSync(messages.perfect);
  }

  return "";
}
