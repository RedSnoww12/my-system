import OnbHeader from '../OnbHeader';
import OnbFooter from '../OnbFooter';
import OnbLayout from '../OnbLayout';
import { T, mono, monoMicro, onbFadeUp } from '../tokens';
import type { Sex } from '@/types';

interface Props {
  step: number;
  total: number;
  value: Sex;
  setValue: (v: Sex) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: { key: Sex; label: string; sub: string; icon: string }[] = [
  { key: 'M', label: 'Homme', sub: '+5 kcal', icon: 'male' },
  { key: 'F', label: 'Femme', sub: '−161 kcal', icon: 'female' },
];

export default function SexScreen({
  step,
  total,
  value,
  setValue,
  onNext,
  onBack,
}: Props) {
  return (
    <OnbLayout
      header={
        <OnbHeader step={step} total={total} label="SEX_ID" onBack={onBack} />
      }
      footer={<OnbFooter primary="Continuer" onPrimary={onNext} />}
    >
      <div style={onbFadeUp(0)}>
        <div style={{ ...monoMicro, color: T.acc, marginBottom: 8 }}>
          ▸ 02 / BIOMÉTRIE
        </div>
        <h1
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: T.t1,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-.02em',
          }}
        >
          Sexe biologique&nbsp;?
        </h1>
        <p
          style={{
            ...mono,
            fontSize: 12,
            color: T.t3,
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Sert uniquement au calcul du BMR
          <br />
          (Mifflin-St Jeor).
        </p>
      </div>

      <div
        style={{
          ...onbFadeUp(1),
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 24,
        }}
      >
        {OPTIONS.map((opt, idx) => {
          const sel = value === opt.key;
          return (
            <button
              type="button"
              key={opt.key}
              onClick={() => setValue(opt.key)}
              style={{
                padding: '20px 14px',
                borderRadius: 16,
                textAlign: 'center',
                background: sel
                  ? `color-mix(in srgb, ${T.acc} 13%, transparent)`
                  : T.s1,
                border: sel ? `1.5px solid ${T.acc}` : `1px solid ${T.outline}`,
                cursor: 'pointer',
                transition: 'all .25s cubic-bezier(.2,.9,.3,1)',
                transform: sel ? 'scale(1.02)' : 'scale(1)',
                boxShadow: sel
                  ? `0 8px 24px color-mix(in srgb, ${T.acc} 20%, transparent), 0 0 0 1px color-mix(in srgb, ${T.acc} 40%, transparent)`
                  : 'none',
                animationDelay: `${idx * 60 + 100}ms`,
                animation: 'onbCardIn .45s backwards cubic-bezier(.2,.9,.3,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 40,
                  color: sel ? T.acc : T.t2,
                  transition: 'color .2s',
                }}
              >
                {opt.icon}
              </span>
              <div
                style={{
                  ...mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: sel ? T.t1 : T.t2,
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  ...monoMicro,
                  fontSize: 8,
                  color: sel ? T.acc : T.t3,
                }}
              >
                BMR {opt.sub}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ ...onbFadeUp(2), marginTop: 22, paddingBottom: 8 }}>
        <div
          style={{
            background: T.s0,
            border: `1px dashed ${T.outline}`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: T.acc,
              boxShadow: `0 0 8px ${T.acc}`,
              animation: 'onbPulse 1.6s infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ ...monoMicro, fontSize: 8, color: T.t3 }}>
              ▸ FORMULE
            </div>
            <div
              style={{
                ...mono,
                fontSize: 11,
                color: T.t2,
                marginTop: 2,
              }}
            >
              10·kg + 6.25·cm − 5·âge {value === 'F' ? '− 161' : '+ 5'}
            </div>
          </div>
        </div>
      </div>
    </OnbLayout>
  );
}
