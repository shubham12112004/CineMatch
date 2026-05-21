import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, ChevronRight, Star, Film, MessageSquare, Shuffle, ShieldCheck, TrendingUp, Users } from 'lucide-react';

const slides = [
  {
    title: 'Cinematic discovery for real audiences',
    subtitle: 'Premium recommendations, watchlists, and community signals in one elegant OTT-style platform.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80',
  },
  {
    title: 'Explore, save, compare, and share',
    subtitle: 'Built for retention with personalized rows, AI assistance, and lightweight social discovery.',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&q=80',
  },
  {
    title: 'A modern movie home that feels premium',
    subtitle: 'Dark cinema UI, soft motion, and enough whitespace to let the content breathe.',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80',
  },
];

const features = [
  { icon: Film, title: 'Full catalog browsing', text: 'Movies, TV shows, trailers, and detailed title pages.' },
  { icon: Sparkles, title: 'AI recommendations', text: 'Mood-based search, smart suggestions, and watchlist generation.' },
  { icon: Users, title: 'Community hooks', text: 'Reviews, ratings, follows, and public watchlists.' },
  { icon: ShieldCheck, title: 'Production ready', text: 'Clean surfaces, fast loading, and mobile-first behavior.' },
];

export default function LandingPage({ onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <section className="relative isolate overflow-hidden hero-backdrop min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt="Cinematic background"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/60 to-[#05070b]" />
          </motion.div>
        </AnimatePresence>

        <div className="section-shell relative z-10 flex min-h-screen items-end pb-24 pt-28 md:pb-28">
          <div className="max-w-4xl space-y-7">
            <p className="section-kicker">Premium OTT movie discovery</p>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl text-5xl font-black tracking-[-0.06em] text-white md:text-7xl lg:text-8xl"
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="section-copy max-w-2xl text-base md:text-lg"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.16, duration: 0.55 }}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                <Play size={16} fill="currentColor" />
                Watch Now
              </button>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore
                <ChevronRight size={16} />
              </button>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
              >
                <MessageSquare size={16} />
                Get Recommendations
              </button>
            </motion.div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {[
                { label: '500K+ titles', value: 'Films, series, and trailers' },
                { label: 'AI-assisted', value: 'Mood, search, and watchlists' },
                { label: 'Built for retention', value: 'Community and personalization' },
              ].map((item) => (
                <div key={item.label} className="glass-panel rounded-3xl p-4">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-white/55">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-shell relative z-10 -mt-14 pb-20">
          <div className="grid gap-4 md:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-panel card-lift rounded-3xl p-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-red-300">
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-shell relative z-10 pb-24">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
            <div className="glass-panel rounded-[2rem] p-6 md:p-8">
              <p className="section-kicker">For audiences</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white md:text-5xl">Less clutter. More cinema.</h2>
              <p className="section-copy mt-4 max-w-2xl">
                CineMatch is designed like a real streaming product: calm, premium, responsive, and focused on discovery that keeps users coming back.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Netflix-style rails</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Letterboxd community</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">IMDb depth</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Apple TV polish</span>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6 md:p-8">
              <p className="section-kicker">Monetization ready</p>
              <div className="mt-4 space-y-3">
                {['Netflix', 'Prime Video', 'Disney+', 'Sponsored premieres'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/75">
                    <span>{item}</span>
                    <Star size={14} className="text-amber-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/25'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            'Continue watching',
            'Because you watched',
            'Trending discussions',
          ].map((label) => (
            <div key={label} className="glass-panel card-lift rounded-[1.75rem] p-5">
              <p className="section-kicker">{label}</p>
              <p className="mt-3 text-lg font-semibold text-white">Built for repeat visits</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Rows, saves, ratings, and subtle social cues help turn browsing into habit.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
