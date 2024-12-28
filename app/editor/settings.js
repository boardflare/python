export async function saveFunctionToSettings(functionData) {
    try {
        await Office.onReady();
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const key = functionData.name;
            const value = {
                name: functionData.name,
                code: functionData.code,
                description: functionData.description,
                signature: functionData.signature,
                formula: functionData.formula,
                demo: functionData.demo || '',
                timestamp: functionData.timestamp
            };

            settings.add(key, value);
            await context.sync();
            return true;
        });
    } catch (error) {
        console.error('Failed to save to settings:', error);
        return false;
    }
}

export async function getFunctionFromSettings(name) {
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
