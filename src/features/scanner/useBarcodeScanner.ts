import { useCallback, useEffect, useRef, useState } from 'react';

export type ScannerStatus =
  | 'idle'
  | 'starting'
  | 'unsupported'
  | 'denied'
  | 'running'
  | 'decoded'
  | 'error';

export interface ScannerState {
  status: ScannerStatus;
  message: string;
  lastCode: string | null;
}

const EAN_FORMATS: BarcodeFormat[] = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
];

function isBarcodeDetectorAvailable(): boolean {
  return typeof BarcodeDetector !== 'undefined';
}

interface UseScannerOptions {
  enabled: boolean;
  onCodeFound: (code: string) => void;
}

export function useBarcodeScanner({ enabled, onCodeFound }: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const callbackRef = useRef(onCodeFound);
  const [state, setState] = useState<ScannerState>({
    status: 'idle',
    message: '',
    lastCode: null,
  });

  useEffect(() => {
    callbackRef.current = onCodeFound;
  }, [onCodeFound]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.srcObject = null;
      try {
        v.pause();
      } catch {
        /* noop */
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState({
          status: 'unsupported',
          message: 'Caméra indisponible. Saisis le code manuellement.',
          lastCode: null,
        });
        return;
      }
      if (!window.isSecureContext) {
        setState({
          status: 'unsupported',
          message: 'HTTPS requis pour la caméra. Saisie manuelle.',
          lastCode: null,
        });
        return;
      }
      if (!isBarcodeDetectorAvailable()) {
        setState({
          status: 'unsupported',
          message: 'Scanner non supporté. Saisis le code manuellement.',
          lastCode: null,
        });
        return;
      }

      setState({
        status: 'starting',
        message: 'Autorisation caméra…',
        lastCode: null,
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.muted = true;
        await v.play();

        let tries = 0;
        while (v.videoWidth === 0 && tries < 40 && !cancelled) {
          await new Promise((r) => setTimeout(r, 50));
          tries++;
        }
        if (v.videoWidth === 0) {
          setState({
            status: 'error',
            message: 'Vidéo sans dimensions. Saisis le code.',
            lastCode: null,
          });
          return;
        }

        const supported = await BarcodeDetector.getSupportedFormats();
        const formats = EAN_FORMATS.filter((f) =>
          supported.includes(f as BarcodeFormat),
        );
        if (formats.length === 0) {
          setState({
            status: 'unsupported',
            message: 'Formats code-barres non supportés. Saisie manuelle.',
            lastCode: null,
          });
          return;
        }

        const detector = new BarcodeDetector({ formats });
        setState({
          status: 'running',
          message: 'Place le code dans le cadre',
          lastCode: null,
        });

        const loop = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(v);
            if (codes.length > 0) {
              const raw = codes[0].rawValue;
              setState({
                status: 'decoded',
                message: `Code ${raw}`,
                lastCode: raw,
              });
              callbackRef.current(raw);
              return;
            }
          } catch {
            /* NotFound or transient */
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        const message = (e as Error).message ?? 'erreur';
        const status =
          (e as { name?: string }).name === 'NotAllowedError'
            ? 'denied'
            : 'error';
        setState({
          status,
          message: `Caméra KO: ${message}. Saisis le code.`,
          lastCode: null,
        });
      }
    };

    start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, stop]);

  const setMessage = useCallback((message: string) => {
    setState((s) => ({ ...s, message }));
  }, []);

  return { videoRef, state, stop, setMessage };
}
