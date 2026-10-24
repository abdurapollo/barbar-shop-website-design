import React from 'react';
import { BusinessDayHours } from '../types';
import { Clock } from 'lucide-react';
import { getLondonToday, getLondonCurrentMinutes, timeToMinutes } from '../lib/availability';

interface OpeningHoursSectionProps {
  businessHours: BusinessDayHours[];
}

export const OpeningHoursSection: React.FC<OpeningHoursSectionProps> = ({
  businessHours
}) => {
  const todayStr = getLondonToday();
  const todayDate = new Date(todayStr + 'T00:00:00Z');
  const currentDayOfWeek = todayDate.getUTCDay();
  const currentLondonMins = getLondonCurrentMinutes();

  const todayHours = businessHours.find(h => h.day_of_week === currentDayOfWeek);

  let statusText = 'Closed';
  let isOpenNow = false;
  let isOpeningSoon = false;

  if (todayHours && !todayHours.is_closed) {
    const openM = timeToMinutes(todayHours.open_time);
    const closeM = timeToMinutes(todayHours.close_time);

    if (currentLondonMins < openM) {
      statusText = `Opens today at ${todayHours.open_time}`;
      isOpeningSoon = true;
    } else if (currentLondonMins >= openM && currentLondonMins <= closeM) {
      statusText = `Open Now · Closes at ${todayHours.close_time}`;
      isOpenNow = true;
    } else {
      statusText = `Closed for today · Reopens tomorrow`;
    }
  } else {
    statusText = 'Closed today';
  }

  // Sorted display starting Monday (1) through Sunday (0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0].map(dayNum => 
    businessHours.find(h => h.day_of_week === dayNum)
  ).filter(Boolean) as BusinessDayHours[];

  return (
    <div className="bg-[#121418] border border-neutral-800 rounded-xl p-6 space-y-5 shadow-lg relative overflow-hidden">
      {/* Top ambient highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-base font-bold text-[#F5F3ED]">Opening Hours</h3>
        </div>

        {/* Live Radar Status Beacon */}
        <div className="flex items-center gap-2">
          {isOpenNow && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
          {isOpeningSoon && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          )}
          <span className={`text-xs font-semibold ${
            isOpenNow ? 'text-emerald-400' : isOpeningSoon ? 'text-amber-400' : 'text-neutral-400'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Weekday Table with Animated Today Highlight */}
      <div className="space-y-1.5 text-xs">
        {orderedDays.map(day => {
          const isToday = day.day_of_week === currentDayOfWeek;

          return (
            <div 
              key={day.day_of_week}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ${
                isToday 
                  ? 'bg-[#1D2128] font-semibold text-[#F5F3ED] border-l-2 border-l-[#D4AF37] border-neutral-700/80 shadow-[0_2px_12px_rgba(212,175,55,0.08)]' 
                  : 'text-neutral-300 hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{day.day_name}</span>
                {isToday && (
                  <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#D4AF37]/15 rounded">
                    Today
                  </span>
                )}
              </div>
              <div className="font-mono tabular-nums">
                {day.is_closed ? (
                  <span className="text-neutral-500">Closed</span>
                ) : (
                  <span className={isToday ? 'text-[#D4AF37]' : 'text-neutral-300'}>
                    {day.open_time} - {day.close_time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
        <span>Walk-ins welcome all day</span>
        <span className="text-[#D4AF37] font-medium">1202 Leeds Rd</span>
      </div>
    </div>
  );
};
