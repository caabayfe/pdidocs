class IframeEmbedCheckService {
  constructor() {
    this.restClient = sn_ws.RESTMessageV2;
  }

  checkUrlEmbeddability(url) {
    if (!url) {
      return {
        statusCode: 400,
        body: {
          error: gs.getMessage("Missing 'url' query parameter"),
        },
      };
    }

    try {
      const client = new this.restClient();
      client.setEndpoint(url);
      client.setHttpMethod('GET');

      const res = client.executeAsync();
      const statusCode = res.getStatusCode();

      if (!statusCode || statusCode < 200 || statusCode >= 400) {
        return {
          statusCode: 200,
          body: {
            url,
            statusCode,
            canEmbed: false,
            error: gs.getMessage('Invalid or unreachable URL'),
          },
        };
      }

      const xfo = res.getHeader('X-Frame-Options');
      const csp = res.getHeader('Content-Security-Policy');
      const canEmbed = !xfo && !csp;

      return {
        statusCode: 200,
        body: {
          url,
          statusCode,
          canEmbed,
        },
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: {
          error: gs.getMessage('Error occurred: {0}', [e.message]),
          canEmbed: false,
        },
      };
    }
  }
}

module.exports = IframeEmbedCheckService;
