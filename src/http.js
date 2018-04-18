/**
 * Send various HTTP requests.
 * @module http
 * @private
 */
'use strict';

/**
 * Send a HTTP get request.
 * @param {string} url Absolute or relative URL to get.
 * @returns {JQueryPromise} This `JQueryPromise` will return the data from the `url`. If the `url` is not
 * found, it will return `null`.
 */
function get(url) {

    var $ = require('../external/jquery');

    var d = $.Deferred();

    $.get(url, function(data) {
        d.resolve(data);
    }).fail(function() {
        d.resolve(null);
    });

    return d.promise();
}

module.exports = {
    get: get
};

