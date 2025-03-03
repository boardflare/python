import { pyLogs } from '../../taskpane/utils/logs';

async function getFunctionFromSettings(name) {
    try {
        await Office.onReady();
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const setting = settings.getItem(name);
            setting.load("value");
            await context.sync();
            return setting.value;
        });
    } catch (error) {
        pyLogs({ errorMessage: `[GetFunction] Failed to get from settings: ${error.message}`, ref: 'get_settings_error' });
        console.error('Failed to get from settings:', error);
        return null;
    }
}

export async function getFunction(func) {
    if (!func.startsWith('workbook-settings:')) {
        return func;
    }

    const name = func.replace('workbook-settings:', '').trim();
    if (!name) {
        const error = new Error('Function name not found in settings reference');
        pyLogs({ errorMessage: '[GetFunction] Function name not found in settings reference', ref: 'get_function_name_error', code: func });
        throw error;
    }

    const functionData = await getFunctionFromSettings(name);
    if (!functionData) {
        const error = new Error(`Function "${name}" not found in workbook settings.  Try saving it again.`);
        pyLogs({ errorMessage: `[GetFunction] Function "${name}" not found in workbook settings`, ref: 'get_function_data_error', code: func });
        throw error;
    }

    return functionData.code + (functionData.resultLine || '');
}