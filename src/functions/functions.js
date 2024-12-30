/* global clearInterval, console, setInterval */
import { queueTask } from './utils/common.js';
import { runPython } from './runpy/controller.js';

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