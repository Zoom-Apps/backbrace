/**
 * HTTP module.
 */
'use strict';

/**
 * Send a HTTP get request.
 * @param {string} url - URL to get.
 * @returns {JQueryPromise}
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
