interface Props {
  sessionCount: number;
  streak: number;
}

export default function SportHeader({ sessionCount, streak }: Props) {
  return (
    <section className="kl-sport-head">
      <div className="kl-sport-head-tag">
        <span className="kl-sport-head-led" aria-hidden />
        WORKOUT LOGGER
      </div>
      <h1 className="kl-sport-head-title">Sport</h1>
      <div className="kl-sport-head-sub">
        {sessionCount} session{sessionCount > 1 ? 's' : ''} · 7j
        {streak > 0 && (
          <>
            {' · '}
            <span className="kl-sport-head-streak">streak {streak}</span>
          </>
        )}
      </div>
    </section>
  );
}
