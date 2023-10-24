export function convertObjectUint8ArrayToBuffer(obj: any) {
    let result: any = {};
    if (Array.isArray(obj)) result = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value instanceof Uint8Array) {
                result[key] = Array.from(value);
            } else if (typeof value === 'object') {
                result[key] = convertObjectUint8ArrayToBuffer(value);
            } else {
                result[key] = value;
            }
        }
    }

    return result;
}