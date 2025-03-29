import { pyLogs } from '../../taskpane/utils/logs';

async function getFunctionFromSettings(name) {
    await Office.onReady();
    return await Excel.run(async (context) => {
        const settings = context.workbook.settings;
        const setting = settings.getItem(name);
        setting.load("value");
        await context.sync();
        return setting.value;
    });
}

export async function getFunction(code) {
    try {
        const name = code.replace('workbook-settings:', '').trim();

        if (!name) {
            throw new Error('Function name not defined');
        }

        const functionData = await getFunctionFromSettings(name);

        if (!functionData?.code) {
            throw new Error(`Function does not have code defined.`);
        }

        return functionData.code + (functionData.resultLine || '');
    } catch (error) {
        pyLogs({ message: error.message, ref: 'get_function_error', code: code });
        throw error;
    }
}