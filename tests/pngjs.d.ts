// Type shim for pngjs (transitive dependency of pixelmatch).
// @types/pngjs is not installed; this provides minimal typings for the usage
// pattern in visual.test.ts.
declare module 'pngjs' {
  export class PNG {
    width: number;
    height: number;
    data: Buffer;
    constructor(options?: { width?: number; height?: number });
    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG): Buffer;
    };
  }
}
