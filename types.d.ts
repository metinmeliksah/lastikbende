// Type definitions for missing modules

// Global type declarations for missing modules to fix TS errors

/**
 * Declaration for raf module used by canvg in jspdf
 */
declare module 'raf' {
  const raf: (callback: FrameRequestCallback) => number;
  export = raf;
}

/**
 * Declaration for yauzl module used by extract-zip in puppeteer
 */
declare module 'yauzl' {
  import { EventEmitter } from 'events';
  import { Readable } from 'stream';

  export interface Options {
    autoClose?: boolean;
    lazyEntries?: boolean;
    decodeStrings?: boolean;
    validateEntrySizes?: boolean;
    strictFileNames?: boolean;
  }

  export interface Entry {
    fileName: string;
    extraFields: Array<{ id: number; data: Buffer }>;
    comment: string;
    compressedSize: number;
    uncompressedSize: number;
    fileNameLength: number;
    extraFieldLength: number;
    commentLength: number;
    versionMadeBy: number;
    versionNeededToExtract: number;
    generalPurposeBitFlag: number;
    compressionMethod: number;
    lastModDateRaw: number;
    lastModDate: Date;
    crc32: number;
    internalFileAttributes: number;
    externalFileAttributes: number;
    relativeOffsetOfLocalHeader: number;
  }

  export interface ZipFile extends EventEmitter {
    readEntry(): void;
    openReadStream(entry: Entry, callback: (err: Error | null, stream?: Readable) => void): void;
    close(): void;
  }

  export function open(path: string, options: Options, callback: (err: Error | null, zipfile?: ZipFile) => void): void;
  export function fromBuffer(buffer: Buffer, options: Options, callback: (err: Error | null, zipfile?: ZipFile) => void): void;
}

/**
 * Declaration for trusted-types
 */
declare module 'trusted-types' {
  export interface TrustedTypePolicyFactory {
    createPolicy(name: string, rules: any): any;
    getExposedPolicy(name: string): any;
    getPolicyNames(): string[];
    isHTML(value: any): boolean;
    isScript(value: any): boolean;
    isScriptURL(value: any): boolean;
  }

  const trustedTypes: TrustedTypePolicyFactory;
  export default trustedTypes;
} 