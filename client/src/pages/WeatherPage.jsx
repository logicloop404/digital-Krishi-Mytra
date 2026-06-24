import { CloudRain, CloudSun, Droplets, Sun, Wind, Umbrella, Volume2, VolumeX } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { forecast } from '../lib/constants';
import { useAudioReader } from '../hooks/useAudioReader';

const weatherIcons = { Sun, CloudSun, CloudRain };

export default function WeatherPage() {
  const { speak, stop, isPlaying } = useAudioReader();

  const handleListenWeather = () => {
    if (isPlaying) {
      stop();
    } else {
      speak("Weather for Nashik, Maharashtra today. It is partly cloudy, 29 degrees Celsius, feels like 31. Humidity is 68 percent, wind is 12 kilometers per hour, rain chance is 18 percent. Dry morning conditions are suitable for spraying and sowing. Rain probability increases late Friday. Weekly guidance: Rain alert for Friday, best fields window is Tuesday to Thursday.");
    }
  };

  return (
    <>
      <PageHeader
        title="Weather Intelligence"
        subtitle="Field-ready forecasts and timely farming guidance for your region."
        action={
          <button
            onClick={handleListenWeather}
            className={`btn-secondary ${isPlaying ? 'bg-forest-50 border-forest-300 text-forest-700' : ''}`}
          >
            {isPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />} {isPlaying ? 'Stop Reading' : 'Listen to Forecast'}
          </button>
        }
      />
      <section className="overflow-hidden rounded-lg bg-forest-700 text-white">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white/70">Nashik, Maharashtra · Today</p>
            <div className="mt-4 flex items-center gap-5">
              <CloudSun size={62} strokeWidth={1.5} />
              <p className="text-6xl font-bold">29°</p>
              <div className="border-l border-white/20 pl-5">
                <p className="font-semibold">Partly cloudy</p>
                <p className="mt-1 text-sm text-white/70">Feels like 31°</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm text-white/75">
              Dry morning conditions are suitable for spraying and sowing. Rain probability increases late Friday.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 self-end">
            <div className="rounded-md bg-white/10 p-3">
              <Droplets className="text-sky-200" size={19} />
              <p className="mt-3 text-lg font-bold">68%</p>
              <p className="text-xs text-white/65">Humidity</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <Wind className="text-sky-200" size={19} />
              <p className="mt-3 text-lg font-bold">12</p>
              <p className="text-xs text-white/65">km/h wind</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <Umbrella className="text-sky-200" size={19} />
              <p className="mt-3 text-lg font-bold">18%</p>
              <p className="text-xs text-white/65">Rain chance</p>
            </div>
          </div>
        </div>
      </section>
      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-slate-900">7-day forecast</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {forecast.map((day) => {
            const Icon = weatherIcons[day.icon];
            return (
              <div className={`rounded-md border p-3 text-center ${day.day === 'Today' ? 'border-forest-300 bg-forest-50' : 'border-slate-100'}`} key={day.day}>
                <p className="text-sm font-semibold text-slate-700">{day.day}</p>
                <Icon className="mx-auto my-3 text-forest-600" size={26} />
                <p className="text-sm font-bold text-slate-800">
                  {day.high}° <span className="font-normal text-slate-400">{day.low}°</span>
                </p>
                <p className="mt-2 text-xs text-sky-600">{day.rain}% rain</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="panel border-l-4 border-l-amber-500 p-5">
          <h3 className="font-bold text-slate-900">Rain alert: Friday</h3>
          <p className="mt-2 text-sm text-slate-500">74% probability of rain. Avoid applying fertilizer or pesticide on Thursday evening.</p>
        </article>
        <article className="panel border-l-4 border-l-forest-500 p-5">
          <h3 className="font-bold text-slate-900">Best field window</h3>
          <p className="mt-2 text-sm text-slate-500">Tuesday to Thursday morning is ideal for sowing, weeding, and irrigation checks.</p>
        </article>
        <article className="panel border-l-4 border-l-sky-500 p-5">
          <h3 className="font-bold text-slate-900">Irrigation guidance</h3>
          <p className="mt-2 text-sm text-slate-500">Reduce irrigation cycles by 15% this week to account for projected rainfall.</p>
        </article>
      </section>
    </>
  );
}
