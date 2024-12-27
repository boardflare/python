# Excel Add-in Settings Documentation

## Overview
Excel add-ins can persist state and settings using the `Settings` API. This allows storing key-value pairs in the workbook.  See [docs](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/persisting-add-in-state-and-settings#custom-properties-in-excel-and-word).

## Basic Usage

### Getting and Setting Values
```javascript
// Basic set/get operations
const context = new Excel.RequestContext();
const settings = context.workbook.settings;

// Set a value
settings.add("myKey", "myValue");
await context.sync();

// Get a value
const setting = settings.getItem("myKey");
setting.load("value");
await context.sync();
const value = setting.value;
```

## Listing All Settings
```javascript
// Load all settings
const settings = context.workbook.settings;
settings.load("items");
await context.sync();

// Iterate through settings
settings.items.forEach(setting => {
    console.log(setting.key, setting.value);
});
```

## Size Limits
Settings can store large strings, but there are practical limits:
```javascript
// Example storing 1MB string
const largeString = "a".repeat(1000000);
settings.add("largeString", largeString);
await context.sync();
```

## Error Handling
Always wrap settings operations in try/catch:
```javascript
try {
    const context = new Excel.RequestContext();
    const settings = context.workbook.settings;
    settings.add(key, value);
    await context.sync();
} catch (error) {
    // Handle errors
    console.error(`Settings operation failed: ${error.message}`);
}
```

## Best Practices
- Always 

await context.sync()

 after modifications
- Load settings before reading values
- Use try/catch blocks for error handling
- Consider size limitations for stored values