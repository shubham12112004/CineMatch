import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Users, TrendingUp, Award, Zap, Star, ChevronRight, Search, MessageSquare, Shuffle } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Discover Your Next Favorite Movie",
      subtitle: "AI-Powered Recommendations Just For You",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
      gradient: "from-purple-900/90 via-red-900/80 to-black/70"
    },
    {
      title: "Chat With AI Cinema Expert",
      subtitle: "Get Personalized Movie Suggestions Instantly",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80",
      gradient: "from-blue-900/90 via-indigo-900/80 to-black/70"
    },
    {
      title: "Compare Movies Side by Side",
      subtitle: "Make The Perfect Choice Every Time",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80",
      gradient: "from-emerald-900/90 via-teal-900/80 to-black/70"
    },
    {
      title: "Build Your Ultimate Watchlist",
      subtitle: "Never Forget What To Watch Next",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
      gradient: "from-amber-900/90 via-orange-900/80 to-black/70"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Slider Section */}
        <div className="relative min-h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            {heroSlides.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-linear-to-r ${slide.gradient}`} />
                  
                  {/* Content */}
                  <div className="relative h-screen flex flex-col items-center justify-center px-4 md:px-12 text-center">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="space-y-8 max-w-5xl"
                    >
                      {/* Logo */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                      >
                        <img src="/logo.png" alt="CineMatch logo" className="h-8 w-8 rounded-lg object-cover" />
                        <span className="text-2xl font-black tracking-tighter">CINEMATCH</span>
                      </motion.div>

                      {/* Slide Title */}
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl"
                      >
                        {slide.title}
                      </motion.h1>

                      {/* Slide Subtitle */}
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-xl md:text-3xl text-gray-200 font-bold tracking-wide"
                      >
                        {slide.subtitle}
                      </motion.p>

                      {/* CTA Button */}
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onGetStarted}
                        className="group relative px-12 py-5 bg-red-600 rounded-full font-black text-xl uppercase tracking-widest text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] hover:shadow-[0_0_80px_rgba(220,38,38,0.7)] transition-all mt-4 inline-flex items-center gap-4"
                      >
                        <Play size={28} className="group-hover:scale-110 transition-transform" />
                        Sign Up Free
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>

                      {/* Trust Indicators */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.8 }}
                        className="flex items-center justify-center gap-6 text-sm text-gray-300"
                      >
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">500K+ Movies</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-red-400" />
                          <span className="font-semibold">AI Powered</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-400" />
                          <span className="font-semibold">Free Forever</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-12 bg-red-600 shadow-lg shadow-red-600/50' 
                    : 'w-8 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-red-600 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-20 md:py-32 px-4 md:px-12 bg-black/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                Powered by Intelligence
              </h2>
              <p className="text-gray-400 text-lg">Everything you need to find your next favorite film</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sparkles size={32} className="text-red-500" />,
                  title: 'AI Smart Finder',
                  desc: 'Answer a few questions and let our AI find the perfect movie based on your mood'
                },
                {
                  icon: <TrendingUp size={32} className="text-red-500" />,
                  title: 'Trending Worldwide',
                  desc: 'Discover what\'s trending globally across multiple regions and languages'
                },
                {
                  icon: <Users size={32} className="text-red-500" />,
                  title: 'Compare & Discuss',
                  desc: 'Compare two titles with AI analysis and get instant recommendations'
                },
                {
                  icon: <Zap size={32} className="text-red-500" />,
                  title: 'Lightning Fast',
                  desc: 'Optimized performance with lazy-loaded components for instant access'
                },
                {
                  icon: <Award size={32} className="text-red-500" />,
                  title: 'Top Rated Content',
                  desc: 'Filter by ratings, genres, countries, and languages instantly'
                },
                {
                  icon: <Play size={32} className="text-red-500" />,
                  title: 'My Watchlist',
                  desc: 'Build your personalized collection and save it to your account'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-red-600/30 transition-all group"
                >
                  <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg group-hover:bg-red-600/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 md:py-32 px-4 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '500K+', label: 'Movies & Shows' },
                { number: '50+', label: 'Countries' },
                { number: '100+', label: 'Languages' },
                { number: '24/7', label: 'AI Support' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="space-y-2"
                >
                  <p className="text-4xl md:text-5xl font-black text-red-600">{stat.number}</p>
                  <p className="text-gray-400 font-bold tracking-wide uppercase text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="py-16 px-4 md:px-12 bg-linear-to-t from-black/50 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
              Ready to Find Your Next Favorite?
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-12 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all shadow-lg mx-auto block"
            >
              Sign In Now
            </motion.button>
            <p className="text-gray-500 text-sm font-medium">
              Free access. No credit card required.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
