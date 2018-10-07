/**
 * Code execution module. Handles execution of async code.
 * @module code
 * @private
 */

import { error } from './error';
import { debug as logDebug, object as logObject } from './log';
import { get as getJquery } from './providers/jquery';
import { CodeThread } from './classes/codethread';

const codeError = error('code');

/**
 * @type {CodeThread}
 * @ignore
 */
let currentThread = null;

/**
 * @type {CodeThread[]}
 * @ignore
 */
let threads = [];

/**
 * @method reset
 * @ignore
 * @description
 * Reset all code threads.
 * @returns {void}
 */
export function reset() {

    // Clear the current queue.
    if (currentThread) {

        // Output the current executing function (for debugging).
        if (currentThread.currFunction)
            logObject(currentThread.currFunction);

        currentThread.queue = [];
    }

    // Kill off all threads.
    logDebug('Clearing all threads.');
    threads = [];
    currentThread = null;

}

/**
 * @method runNextThread
 * @private
 * @description
 * Run the next code thread in the queue.
 * @returns {void}
 */
function runNextThread() {
    currentThread = null;
    if (threads.length === 0)
        return;
    currentThread = threads.shift();
    currentThread.run(runNextThread);
}

/**
 * @method codeblock
 * @memberof module:bb
 * @description
 * Setup a new block of functions to run.
 *
 * Each function will be run in order.
 *
 * @param {...GenericFunction} args Functions to run.
 * @returns {JQueryPromise} Promise to run the functions.
 * @example
 * return bb.codeblock(
 *  function() {
 *      // this will run first.
 *  },
 *  function() {
 *      // this will run second.
 *  }
 * );
 */
export function codeblock(...args) {

    const $ = getJquery();

    if (!currentThread)
        throw codeError('nothread', 'Attempted to start a codeblock without a thread');

    let w = $.Deferred();

    CodeThread.prototype.createQueue.apply(currentThread, args);

    return w.promise();
}

/**
 * @method codeinsert
 * @memberof module:bb
 * @description
 * Insert code into the current codeblock.
 * @param {...Function} args Functions to run.
 * @returns {void}
 */
export function codeinsert(...args) {

    if (!currentThread)
        throw codeError('nothread', 'Attempted to insert into a codeblock without a thread');

    CodeThread.prototype.insert.apply(currentThread, args);
}

/**
 * @method codeeach
 * @memberof module:bb
 * @description
 * Loop through an array using `codeblock`.
 * @template T
 * @param {ArrayLike<T>} obj Object to iterate through.
 * @param {function(T,Key,ArrayLike<T>)} iterator Iterator function to call.
 * @param {*} [context] Context to run the iterator function.
 * @returns {JQueryPromise} Promise to return after we are done looping.
 */
export function codeeach(obj, iterator, context) {

    const func = function(key) {
        return codeblock(

            function() {
                return iterator.call(context, obj[key], key, obj);
            },

            function(ret) {
                if (key < obj.length - 1)
                    return func(key + 1);
                return ret;
            }

        );
    };

    if (obj.length > 0)
        return codeblock(
            function() {
                return func(0);
            }
        );
}

/**
 * @method codethread
 * @memberof module:bb
 * @description
 * Start a new code thread to execute code when possible.
 * @param {...GenericFunction} args Functions to run.
 * @returns {void}
 */
export function codethread(...args) {

    const func = function() {
        return codeblock.apply(this, args);
    },
        thread = new CodeThread(func);

    logDebug('Created new thread');

    // Add the thread to the queue.
    threads.push(thread);

    // If nothing is running, run this thread.
    if (!currentThread)
        runNextThread();
}