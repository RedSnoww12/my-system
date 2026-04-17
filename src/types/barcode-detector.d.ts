interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: { x: number; y: number }[];
  format: string;
  rawValue: string;
}

type BarcodeFormat =
  | 'aztec'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'data_matrix'
  | 'ean_13'
  | 'ean_8'
  | 'itf'
  | 'pdf417'
  | 'qr_code'
  | 'upc_a'
  | 'upc_e'
  | 'unknown';

interface BarcodeDetectorOptions {
  formats?: BarcodeFormat[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  detect(
    source:
      | HTMLImageElement
      | HTMLVideoElement
      | HTMLCanvasElement
      | ImageBitmap
      | OffscreenCanvas
      | Blob
      | ImageData,
  ): Promise<DetectedBarcode[]>;
  static getSupportedFormats(): Promise<BarcodeFormat[]>;
}
