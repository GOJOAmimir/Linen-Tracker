//  src/types/pdfmake.d.ts
//  -----------------------------------------------------------
//  Deklarasi module agar TypeScript mengenali pdfmake CommonJS bundle
//  + vfs_fonts (font‐embedding) tanpa error `any` / “cannot find module”

declare module 'pdfmake/build/pdfmake' {
  import type { TDocumentDefinitions } from 'pdfmake/interfaces';

  /** API yang dikembalikan pdfMake.createPdf(...) */
  interface CreatePdf {
    getBlob(cb: (blob: Blob) => void): void;
    download(defaultFileName?: string): void;
    open(): void;
    print(): void;
  }

  /** Objek global yang diekspor oleh bundle `build/pdfmake.js` */
  const pdfMake: {
    vfs: Record<string, string>;
    createPdf: (doc: TDocumentDefinitions) => CreatePdf;
  };

  export = pdfMake;            // ⬅️  CommonJS style export
}

declare module 'pdfmake/build/vfs_fonts' {
  /**
   * Bundle ini hanya menambah properti `.vfs` ke `pdfMake`.
   * Kami ekspor isi apa adanya supaya bisa di‑import dan die‑execute.
   */
  const vfsFonts: { pdfMake: { vfs: Record<string, string> } };
  export = vfsFonts;           // ⬅️  juga CommonJS
}
