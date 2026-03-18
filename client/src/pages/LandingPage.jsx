import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiStar, FiArrowRight, FiMenu, FiX, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

// Sample data for designs
const popularDesigns = [
  {
    id: 1,
    title: 'Modern Minimalist Villa',
    style: 'Modern',
    cost: '₹45,00,000',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    bedrooms: 4,
    bathrooms: 3,
    area: '2,500 sqft'
  },
  {
    id: 2,
    title: 'Contemporary Duplex',
    style: 'Contemporary',
    cost: '₹38,00,000',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    bedrooms: 3,
    bathrooms: 2,
    area: '2,100 sqft'
  },
  {
    id: 3,
    title: 'Traditional Indian Home',
    style: 'Traditional',
    cost: '₹52,00,000',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    bedrooms: 5,
    bathrooms: 4,
    area: '3,200 sqft'
  },
  {
    id: 4,
    title: 'Luxury Mediterranean Villa',
    style: 'Mediterranean',
    cost: '₹75,00,000',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    bedrooms: 6,
    bathrooms: 5,
    area: '4,500 sqft'
  },
  {
    id: 5,
    title: 'Eco-Friendly Green Home',
    style: 'Sustainable',
    cost: '₹32,00,000',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,800 sqft'
  },
  {
    id: 6,
    title: 'Compact Urban House',
    style: 'Minimalist',
    cost: '₹25,00,000',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200 sqft'
  }
];

// Sample data for engineers
const topEngineers = [
  {
    id: 1,
    name: 'Ar. Rahul Sharma',
    specialization: 'Modern Architecture',
    rating: 4.9,
    reviews: 156,
    projects: 45,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
  },
  {
    id: 2,
    name: 'Ar. Priya Patel',
    specialization: 'Sustainable Design',
    rating: 4.8,
    reviews: 132,
    projects: 38,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
  },
  {
    id: 3,
    name: 'Ar. Amit Kumar',
    specialization: 'Traditional Indian',
    rating: 4.9,
    reviews: 178,
    projects: 52,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
  },
  {
    id: 4,
    name: 'Ar. Sneha Reddy',
    specialization: 'Luxury Villas',
    rating: 4.7,
    reviews: 98,
    projects: 28,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
  }
];

// Sample testimonials
const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    rating: 5,
    text: 'BuildMyHome helped me find my dream house design within my budget. The engineers are highly professional and delivered exactly what I wanted.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
  },
  {
    id: 2,
    name: 'Anita Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'Excellent platform! The design consultation was seamless and the final design exceeded our expectations. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
  },
  {
    id: 3,
    name: 'Vikram Singh',
    location: 'Bangalore',
    rating: 4,
    text: 'Great experience working with the engineers. The attention to detail and timely delivery made our home building journey smooth.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'
  },
  {
    id: 4,
    name: 'Meera Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'Found the perfect design for our family home. The team was responsive and the quality of work is exceptional.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-primary">Build</span>
              <span className="text-secondary">MyHome</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#designs" className="text-dark hover:text-primary transition-colors">Designs</a>
            <a href="#engineers" className="text-dark hover:text-primary transition-colors">Engineers</a>
            <a href="#how-it-works" className="text-dark hover:text-primary transition-colors">How It Works</a>
            <a href="#testimonials" className="text-dark hover:text-primary transition-colors">Reviews</a>
            <button className="btn-primary">
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-dark">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#designs" className="block text-dark hover:text-primary">Designs</a>
              <a href="#engineers" className="block text-dark hover:text-primary">Engineers</a>
              <a href="#how-it-works" className="block text-dark hover:text-primary">How It Works</a>
              <a href="#testimonials" className="block text-dark hover:text-primary">Reviews</a>
              <button className="btn-primary w-full">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80" 
          alt="Luxury House" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Design Your <span className="text-secondary">Dream Home</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Connect with expert architects and engineers to bring your perfect home to life
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex items-center shadow-2xl">
            <div className="flex-1 px-4">
              <input 
                type="text" 
                placeholder="Search for house designs..." 
                className="w-full outline-none text-dark"
              />
            </div>
            <button className="btn-primary rounded-full px-8 flex items-center gap-2">
              <FiSearch /> Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12">
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-gray-300">Designs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">120+</p>
              <p className="text-gray-300">Engineers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">1000+</p>
              <p className="text-gray-300">Happy Clients</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

// Features Section
const Features = () => {
  const features = [
    { title: 'Expert Engineers', desc: 'Verified professionals with years of experience', icon: '🏗️' },
    { title: 'Custom Designs', desc: 'Tailored to your preferences and budget', icon: '🎨' },
    { title: 'Quality Assured', desc: 'Industry-standard construction practices', icon: '✅' },
    { title: '24/7 Support', desc: 'Round-the-clock assistance for your queries', icon: '💬' }
  ];

  return (
    <section className="py-20 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Everything You Need to Build
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive solutions for all your home building needs
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-dark mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Popular Designs Section
const PopularDesigns = () => {
  return (
    <section id="designs" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Popular House <span className="text-primary">Designs</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our trending house designs curated just for you
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularDesigns.map((design, index) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden hover-zoom">
                <img 
                  src={design.image} 
                  alt={design.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                  {design.style}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-dark mb-2">{design.title}</h3>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <span>🛏️ {design.bedrooms} Beds</span>
                  <span>🚿 {design.bathrooms} Baths</span>
                  <span>📐 {design.area}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{design.cost}</span>
                  <button className="btn-primary text-sm py-2 px-4">
                    View Design
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="btn-secondary inline-flex items-center gap-2">
            View All Designs <FiArrowRight />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// Top Engineers Section
const TopEngineers = () => {
  return (
    <section id="engineers" className="py-20 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Top <span className="text-secondary">Engineers</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
            Work with the best architects and engineers in the industry
          </motion.p>
        </motion.div>

        {topEngineers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topEngineers.map((engineer, index) => (
              <motion.div
                key={engineer.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="relative mb-4">
                  <img 
                    src={engineer.image} 
                    alt={engineer.name || 'Engineer'} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/20 shadow-lg"
                  />
                  <div className="absolute bottom-0 right-1/2 translate-x-10 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-dark mb-1">
                    {engineer.name || 'Unnamed Engineer'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {engineer.specialization || 'Specialist'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <FiStar className="text-yellow-400 fill-current" />
                    <span className="font-semibold">
                      {engineer.rating || 0}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({engineer.reviews || 0} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {engineer.projects || 0} projects completed
                  </p>
                  <button className="btn-primary w-full">
                    Book Consultation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No engineers available at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorks = () => {
  const steps = [
    { 
      number: '01', 
      title: 'Browse Designs', 
      desc: 'Explore our collection of 500+ house designs',
      icon: '🔍'
    },
    { 
      number: '02', 
      title: 'Select Engineer', 
      desc: 'Choose a verified engineer that matches your needs',
      icon: '👷'
    },
    { 
      number: '03', 
      title: 'Customize Design', 
      desc: 'Work with your engineer to customize the design',
      icon: '🎨'
    },
    { 
      number: '04', 
      title: 'Start Building', 
      desc: 'Begin construction with expert guidance',
      icon: '🏠'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark mb-4">
            How It <span className="text-primary">Works</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simple steps to build your dream home
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl">
                    {step.icon}
                  </div>
                  <span className="text-6xl font-bold text-primary/10 absolute top-4 left-4">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-dark mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark mb-4">
            What Our <span className="text-secondary">Clients Say</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real stories from our satisfied customers
          </motion.p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-lg mb-4">"{testimonials[currentIndex].text}"</p>
                  <h4 className="text-xl font-semibold text-dark">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-500">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              ←
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              →
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Section
const Footer = () => {
  const links = {
    company: ['About Us', 'Careers', 'Press', 'Blog'],
    services: ['House Designs', 'Architecture', 'Interior Design', 'Consultation'],
    support: ['Help Center', 'Contact Us', 'FAQ', 'Privacy Policy'],
    popular: ['Modern Homes', 'Villa Designs', 'Duplex Houses', 'Budget Homes']
  };

  return (
    <footer className="bg-dark text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="text-3xl font-bold block mb-4">
              <span className="text-primary">Build</span>
              <span className="text-secondary">MyHome</span>
            </span>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your trusted partner in building the home of your dreams. 
              Connect with expert architects and engineers today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {links.services.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <FiPhone /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <FiMail /> info@buildmyhome.com
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin /> Mumbai, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 BuildMyHome. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {links.support.map((link, index) => (
              <a key={index} href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <PopularDesigns />
      <TopEngineers />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default LandingPage;

