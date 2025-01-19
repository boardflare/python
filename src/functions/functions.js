/* global clearInterval, console, setInterval */
import { queueTask } from './utils/queue.js';
import { runPython } from './runpy/controller.js';
import { execPython } from './exec/controller.js';

/**
 * Runs Python code locally in Excel.
 * @customfunction
 * @param {string} code Python code to run.
 * @param {any[][][]} [arg1] Optional arguments to pass.
 * @returns {any[][]} Result of the Python code.
 */

export async function runPy(code, arg1) {
  const args = { code, arg1 };
  return await queueTask(args, runPython);
}

/**
 * Loads and runs code in a wrapper.  INTERNAL - DO NOT USE.
 * @customfunction
 * @param {string} code Code or reference.
 * @param {any[][][]} [arg1] Optional params set as globals.
 * @returns {any[][]} Result of execution.
 */

export async function exec(code, arg1) {
  const args = { code, arg1 };
  return await queueTask(args, execPython);
}