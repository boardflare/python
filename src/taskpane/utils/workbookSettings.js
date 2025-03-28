import { pyLogs } from './logs';
import { DEFAULT_CODE, DEBUG_FLAGS } from './constants';
import { parsePython } from './codeparser';
import { saveWorkbookOnly } from './save';

const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};

export async function saveFunctionToSettings(functionData) {
    if (!functionData?.code) {
        throw new Error('Invalid function data');
    }

    try {
        return await retry(async () => {
            const result = await Excel.run(async (context) => {
                const settings = context.workbook.settings;
                const key = functionData.name;
                const value = functionData;

                settings.add(key, value);
                await context.sync();
            });
            return result;
        });
    } catch (error) {
        pyLogs({ message: `Failed to save after three tries. Error: ${error.message}`, code: functionData?.name || null, ref: "saveFunctionToSettingsError" });
        throw error;
    }
}

export async function getFunctions() {
    try {
        if (DEBUG_FLAGS.FORCE_GET_FUNCTIONS_FAIL) {
            throw new Error('Simulated failure when retrieving functions');
        }

        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const items = settings.load("items");
            await context.sync();
            const functions = items.items.map(item => item.value);
            return functions;
        });
    } catch (error) {
        console.error('Failed to get functions from settings:', error);
        pyLogs({
            message: error.message,
            ref: "getFunctionsError"
        });
        throw error;
    }
}

export async function getFunctionsWithDelay() {
    try {
        return await Excel.run({ delayForCellEdit: true }, async (ctx) => {
            const settings = ctx.workbook.settings;
            const items = settings.load("items");
            await ctx.sync();
            const functions = items.items.map(item => item.value);
            return functions;
        });
    } catch (error) {
        console.error('Fallback method also failed:', error);
        pyLogs({
            message: error.message,
            ref: "getFunctionsWithDelayError"
        });
        throw error;
    }
}

export async function createDefaultFunction() {
    try {
        const defaultFunction = await parsePython(DEFAULT_CODE);
        await saveWorkbookOnly(defaultFunction);
        return defaultFunction;
    } catch (error) {
        pyLogs({
            message: error.message,
            ref: "createDefaultFunctionError"
        });
        throw error;
    }
}

export async function deleteFunctionFromSettings(name) {
    try {
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const setting = settings.getItem(name);
            setting.delete();

            // Also delete from name manager
            const namedItem = context.workbook.names.getItemOrNullObject(name.toUpperCase());
            namedItem.load('isNullObject');
            await context.sync();

            if (!namedItem.isNullObject) {
                namedItem.delete();
            }

            return true;
        });
    } catch (error) {
        console.error('Failed to delete from settings:', error);
        pyLogs({
            message: error.message,
            code: name,
            ref: "deleteFunctionFromSettingsError"
        });
        return false;
    }
}
