export async function textGeneration(prompt, options) {
    const FIXED_KEY = 'key1';

    switch (prompt.toLowerCase()) {
        case 'set':
            return await setProp(FIXED_KEY, options[0][0]);
        case 'get':
            return await getProp(FIXED_KEY);
        default:
            throw new Error('Invalid prompt. Use "set" or "get"');
    }

    async function setProp(key, value) {
        try {
            const context = new Excel.RequestContext();
            const settings = context.workbook.settings;
            settings.add(key, value);
            await context.sync();
            return "Value set successfully";
        } catch (error) {
            throw new Error(`Failed to set value: ${error.message}`);
        }
    }

    async function getProp(key) {
        try {
            const context = new Excel.RequestContext();
            const settings = context.workbook.settings;
            const setting = settings.getItem(key);
            setting.load("value");
            await context.sync();
            console.log(setting.value);
            return setting.value;
        } catch (error) {
            throw new Error(`Failed to get value: ${error.message}`);
        }
    }
}
