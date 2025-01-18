import { pyLogs } from './logs';

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

    return retry(async () => {
        try {
            const result = await Excel.run(async (context) => {
                const settings = context.workbook.settings;
                const key = functionData.name;
                const value = functionData;

                settings.add(key, value);
                await context.sync();
            });
            return result;
        } catch (error) {
            console.error('Failed to save to settings:', error);
            pyLogs({ errorMessage: error.message, code: functionData?.name || null, ref: "saveFunctionToSettingsError" });
            throw error;
        }
    });
}

export async function getFunctionFromSettings(name = null) {
    try {
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            if (name) {
                const setting = settings.getItem(name);
                setting.load("value");
                await context.sync();
                return setting.value;
            } else {
                const items = settings.load("items");
                await context.sync();
                return items.items.map(item => item.value);
            }
        });
    } catch (error) {
        console.error('Failed to get from settings:', error);
        pyLogs({
            errorMessage: error.message,
            code: name || null,
            ref: "getFunctionFromSettingsError"
        });
        return name ? null : [];
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

            await context.sync();
            return true;
        });
    } catch (error) {
        console.error('Failed to delete from settings:', error);
        pyLogs({
            errorMessage: error.message,
            code: name,
            ref: "deleteFunctionFromSettingsError"
        });
        return false;
    }
}
