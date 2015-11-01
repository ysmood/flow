"use strict";

import http from "http";
import flow from "./flow";
import utils from "./utils";

/**
 * Create an array instance with some handy server helper methods.
 * @type {Array} Members:
 * ```js
 * {
 *     // https://nodejs.org/api/http.html#http_class_http_server
 *     server: http.Server,
 *
 *     // https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback
 *     listen: (port) => Promise,
 *
 *     // https://nodejs.org/api/http.html#http_server_close_callback
 *     close: (cb) => Promise,
 * }
 * ```
 * @example
 * ```js
 * import flow from "noflow"
 * let app = flow();
 * app.push("OK");
 * app.listen(8123).then(() => console.log("started"));
 * ```
 */
var app = function () {
    if (arguments.length > 0) {
        return flow.apply(0, arguments);
    }

    var routes = [];
    var server = http.createServer(flow(routes));

    routes.server = server;
    routes.listen = utils.yutils.promisify(server.listen, server);
    routes.close = utils.yutils.promisify(server.close, server);

    return routes;
};

utils.assign(app, utils);

export default app;
