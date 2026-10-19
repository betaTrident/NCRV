import { DateTime } from "luxon"
import { MoonStar } from "lucide-react"

type ActivityProps = {
  activity: { date: string; hours: string }[]
  start: string
  end: string
}

/** Saved ND hours only; distinguish unrecorded dates from saved zero-hour shifts. */
export function OverviewActivity({ activity, start, end }: ActivityProps) {
  const first = DateTime.fromISO(start)
  const last = DateTime.fromISO(end)
  const days = Math.floor(last.diff(first, "days").days) + 1
  const buckets = Array.from({ length: Math.min(days, 62) }, (_, index) => {
    const date = first.plus({ days: index }).toISODate()!
    return { date, hours: activity.find((item) => item.date === date)?.hours ?? null }
  })
  // Long periods use explicitly labelled categories rather than a continuous timeline.
  const points = days > 62 ? activity : buckets
  const max = Math.max(1, ...points.map((item) => Number(item.hours)))
  const hasHours = activity.some((item) => Number(item.hours) > 0)

  return (
    <section className="vx-overview-panel" aria-labelledby="activity-title">
      <div className="vx-overview-section-head">
        <div><h2 id="activity-title">Night-hour activity</h2><p>Saved ND hours by work date; gaps mean no saved shift</p></div>
        <span className="vx-overview-tag"><MoonStar size={14} aria-hidden="true" /> ND hours</span>
      </div>
      {hasHours ? (
        <figure>
          <div className="vx-overview-chart" role="img" aria-label={activity.map((item) => `${item.date}: ${item.hours} ND hours`).join("; ")}>
            {points.map((item) => <div key={item.date} className="vx-overview-chart-column" data-recorded={item.hours !== null} title={`${item.date}: ${item.hours === null ? "No saved shift" : `${item.hours} hrs`}`}>
              {item.hours !== null ? <div className="vx-overview-chart-bar" style={{ height: `${Math.max(2, Number(item.hours) / max * 100)}%` }} /> : null}
            </div>)}
          </div>
          <figcaption className="vx-overview-chart-labels">{days > 62 ? <span>Recorded dates only; gaps omitted. Open daily hours for exact dates.</span> : <><span>{start}</span><span>Scale: 0 to {max.toFixed(2)} hours</span><span>{end}</span></>}</figcaption>
          <details className="vx-overview-chart-data"><summary>View daily hours</summary><dl>{activity.map((item) => <div key={item.date}><dt>{item.date}</dt><dd>{item.hours} hrs</dd></div>)}</dl></details>
        </figure>
      ) : (
        <div className="vx-overview-chart-empty"><MoonStar size={36} strokeWidth={1.25} aria-hidden="true" /><h3>{activity.length ? "No qualifying night hours in this view" : "Your nights will take shape here"}</h3><p>{activity.length ? "Your shifts are saved. Their calculations contain zero ND hours." : "Add a shift to start building your activity view."}</p></div>
      )}
    </section>
  )
}
