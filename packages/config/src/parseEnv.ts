export const ParseEnv = {
  getBoolean(
    data: string | undefined,
    defaultValue: boolean | undefined = undefined
  ): boolean {
    // console.log('@#@# getBoolean data:', data, 'defaultValue', defaultValue);
    if (data === undefined || data === "undefined") {
      if (defaultValue === undefined) {
        throw new TypeError("ParseEnv.getBoolean: Data is undefined");
      } else {
        return defaultValue;
      }
    } else {
      try {
        if (!data.length) {
          // console.log('ParseEnv.getBoolean: Unable to parse empty data as boolean');
          throw new TypeError(
            `ParseEnv.getBoolean: Unable to parse empty data as boolean`
          );
        }
        return Boolean(data?.length ? JSON.parse(data) : false);
      } catch {
        throw new TypeError(
          `ParseEnv.getBoolean: Unable to parse ${data} as boolean`
        );
      }
    }
  },

  getBooleanOrUndefined(
    data: string | undefined,
    defaultValue: boolean | undefined = undefined
  ): boolean | undefined {
    // console.log('@#@# getBooleanOrUndefined data:', data, 'defaultValue', defaultValue);
    try {
      return ParseEnv.getBoolean(data, defaultValue);
    } catch (e: any) {
      return undefined;
    }
  },

  getString(
    data: string | undefined,
    defaultValue: string | undefined = undefined
  ): string {
    // console.log('@#@# data:', data, 'defaultValue', defaultValue);
    if (data === undefined || data === "undefined") {
      if (defaultValue === undefined) {
        throw new TypeError("ParseEnv.getString: Data is undefined");
      } else {
        return defaultValue;
      }
    } else {
      try {
        return String(data);
      } catch {
        throw new TypeError(
          `ParseEnv.getString: Unable to parse ${data} as string`
        );
      }
    }
  },

  getStringOrUndefined(
    data: string | undefined,
    defaultValue: string | undefined = undefined
  ): string | undefined {
    try {
      return ParseEnv.getString(data, defaultValue);
    } catch (e: any) {
      return undefined;
    }
  },

  getNumber(
    data: string | undefined,
    defaultValue: number | undefined = undefined
  ): number {
    // console.log('@#@# data:', data, 'defaultValue', defaultValue);
    if (data === undefined || data === "undefined") {
      if (defaultValue === undefined) {
        throw new TypeError("ParseEnv.getNumber: Data is undefined");
      } else {
        if (isNaN(defaultValue)) {
          throw new TypeError("ParseEnv.getNumber: is NaN");
        }
        return defaultValue;
      }
    } else {
      try {
        if (!data.length) {
          throw new TypeError("ParseEnv.getNumber: is empty");
        }
        const value = Number(data);
        if (isNaN(value)) {
          throw new TypeError("ParseEnv.getNumber: is NaN");
        }
        return value;
      } catch {
        throw new TypeError(
          `ParseEnv.getNumber: Unable to parse ${data} as number`
        );
      }
    }
  },

  getNumberOrUndefined(
    data: string | undefined,
    defaultValue: number | undefined = undefined
  ): number | undefined {
    try {
      return ParseEnv.getNumber(data, defaultValue);
    } catch (e: any) {
      return undefined;
    }
  },
};
