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
                return value; // Return the saved function data
            });
        } catch (error) {
            console.error('Failed to save to settings:', error);
            return false;
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
        return name ? null : [];
    }
}