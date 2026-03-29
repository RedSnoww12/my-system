import type { DailyLog, UserProfile } from '../../types'

interface WeeklyBudgetProps {
  logs: DailyLog[]
  profile: UserProfile
}

/** Returns ISO date strings for Mon→Sun of the week containing `date` */
function getWeekDays(date: string): string[] {
  const d = new Date(date + 'T12:00:00')
  const day = d.getDay() // 0=Sun, 1=Mon …
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().split('T')[0]
  })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function WeeklyBudget({ logs, profile }: WeeklyBudgetProps) {
  const today = todayStr()
  const weekDays = getWeekDays(today)
  const todayIdx = weekDays.indexOf(today) // 0=Mon … 6=Sun

  // Build per-day data
  const days = weekDays.map((date, i) => {
    const log = logs.find((l) => l.date === date)
    const isPast = i < todayIdx
    const isToday = i === todayIdx
    const isFuture = i > todayIdx

    const calTarget = log?.calorie_target ?? profile.calorie_target
    const calConsumed = log?.calories_consumed ?? 0
    const steps = log?.daily_steps ?? 0

    return { date, isPast, isToday, isFuture, calTarget, calConsumed, steps }
  })

  // ── Calories ──
  // Full week budget (every day has a target, known or inferred)
  const weekCalBudget = days.reduce((s, d) => s + d.calTarget, 0)
  // Only count days up to and including today
  const weekCalConsumed = days
    .filter((d) => !d.isFuture)
    .reduce((s, d) => s + d.calConsumed, 0)
  const weekCalBalance = weekCalBudget - weekCalConsumed
  // Remaining days = today + future days
  const remainingDays = 7 - todayIdx // includes today
  // Budget still available for remaining days (future targets already included in balance)
  const futureTargetSum = days.filter((d) => d.isFuture).reduce((s, d) => s + d.calTarget, 0)
  const adjustedDailyTarget =
    remainingDays > 0
      ? Math.round((weekCalBalance - futureTargetSum + futureTargetSum) / remainingDays)
      : 0
  // Simpler: remaining = weekBalance / remainingDays
  const calPerDayLeft = remainingDays > 0 ? Math.round(weekCalBalance / remainingDays) : 0

  const calPct = Math.min(100, Math.round((weekCalConsumed / weekCalBudget) * 100))
  const calSurplus = weekCalConsumed - days.filter((d) => !d.isFuture).reduce((s, d) => s + d.calTarget, 0)

  // ── Steps ──
  const stepGoal = profile.step_goal
  const weekStepTarget = stepGoal * 7
  const weekStepsDone = days.reduce((s, d) => s + d.steps, 0)
  const stepPct = Math.min(100, Math.round((weekStepsDone / weekStepTarget) * 100))
  const stepsPerDayLeft =
    remainingDays > 0
      ? Math.round((weekStepTarget - weekStepsDone) / remainingDays)
      : 0

  // ── Day dots ──
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="bg-dark-800 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Bilan semaine</p>
        <p className="text-xs text-dark-500">
          {new Date(weekDays[0] + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          {' – '}
          {new Date(weekDays[6] + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Day dots */}
      <div className="flex justify-between">
        {days.map((d, i) => {
          const ratio = d.calTarget > 0 ? d.calConsumed / d.calTarget : 0
          const isOver = ratio > 1.05
          const isOk = !d.isFuture && ratio >= 0.85 && ratio <= 1.05
          const isDot = d.isFuture
          return (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                  d.isToday
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-dark-800 bg-accent/20 text-accent'
                    : isOver
                    ? 'bg-danger/20 text-danger'
                    : isOk
                    ? 'bg-success/20 text-success'
                    : isDot
                    ? 'bg-dark-700 text-dark-500'
                    : 'bg-dark-700 text-dark-400'
                }`}
              >
                {dayLabels[i]}
              </div>
              {!d.isFuture && (
                <div className="w-1 h-1 rounded-full bg-dark-500" />
              )}
            </div>
          )
        })}
      </div>

      {/* Calories */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-dark-500">Calories semaine</span>
          <span className="text-xs text-dark-400 tabular-nums">
            {weekCalConsumed.toLocaleString('fr-FR')}
            <span className="text-dark-600"> / {weekCalBudget.toLocaleString('fr-FR')} kcal</span>
          </span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${calPct > 100 ? 'bg-danger' : calPct > 85 ? 'bg-warning' : 'bg-accent'}`}
            style={{ width: `${calPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium tabular-nums ${calSurplus > 0 ? 'text-warning' : 'text-success'}`}>
            {calSurplus > 0 ? `+${calSurplus.toLocaleString('fr-FR')} kcal surplus` : calSurplus < 0 ? `${calSurplus.toLocaleString('fr-FR')} kcal déficit` : 'Dans les clous'}
          </span>
          {remainingDays > 1 && (
            <span className="text-xs text-dark-400 tabular-nums">
              ≈ <span className={`font-semibold ${calPerDayLeft < profile.calorie_target * 0.8 ? 'text-info' : 'text-white'}`}>
                {calPerDayLeft.toLocaleString('fr-FR')}
              </span> kcal/jour ({remainingDays}j restants)
            </span>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 pt-1 border-t border-dark-700">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-dark-500">Pas semaine</span>
          <span className="text-xs text-dark-400 tabular-nums">
            {weekStepsDone.toLocaleString('fr-FR')}
            <span className="text-dark-600"> / {weekStepTarget.toLocaleString('fr-FR')}</span>
          </span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-accent/70 transition-all"
            style={{ width: `${stepPct}%` }}
          />
        </div>
        {remainingDays > 1 && stepsPerDayLeft > 0 && (
          <p className="text-xs text-dark-400 tabular-nums">
            ≈ <span className="font-semibold text-white">{stepsPerDayLeft.toLocaleString('fr-FR')}</span> pas/jour pour atteindre l'objectif
            <span className="text-dark-600"> (moy. {stepGoal.toLocaleString('fr-FR')}/j)</span>
          </p>
        )}
      </div>
    </div>
  )
}
