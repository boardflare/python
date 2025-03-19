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
        pyLogs({ message: `[GetFunction] Failed to get from settings: ${error.message}`, ref: 'get_settings_error' });
        console.error('Failed to get from settings:', error);
        return null;
    }
}

export async function getFunction(code) {

    const name = code.replace('workbook-settings:', '').trim();

    if (!name) {
        const error = new Error('Function name not defined');
        pyLogs({ message: '[GetFunction] Function name not defined', ref: 'get_function_name_error', code: code });
        throw error;
    }

    const functionData = await getFunctionFromSettings(name);

    if (!functionData) {
        const error = new Error(`Function "${name}" not found in workbook settings.  Try saving it again.`);
        pyLogs({ message: `[GetFunction] Function "${name}" not found in workbook settings`, ref: 'get_function_data_error', code: code });
        throw error;
    }

    return functionData.code + (functionData.resultLine || '');
}