async function getFunctionFromSettings(name) {
    try {
        await Office.onReady();
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const setting = settings.getItem(name);
            setting.load("value");
            await context.sync();
            console.log('setting.value:', setting.value);
            return setting.value;
        });
    } catch (error) {
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
        throw new Error('Function name not found in settings reference');
    }

    const functionData = await getFunctionFromSettings(name);
    if (!functionData) {
        throw new Error(`Function "${name}" not found in workbook settings`);
    }

    return functionData.code + (functionData.resultLine || '');
}