import React from 'react'
import assets from '../assets/assets'
import Title from './Title'
import ServiceCard from './ServiceCard'
import { motion } from 'motion/react'


const Services = () => {
  const ServicesData = [
    {
      title: "Live Market Prediction",
      description:
        "Real-time price movement predictions powered by our ML model.",
      icon: assets.ads_icon,
    },
    {
      title: "Model Confidence",
      description: "See prediction accuracy, confidence scores, and recent performance.",
      icon: assets.marketing_icon,
    },
    {
      title: "Signal History",
      description:
        "Track past predictions and compare them with actual market outcomes.",
      icon: assets.content_icon,
    },
    {
      title: "Risk Analysis",
      description:
        "ML-based risk assessment before every trade decision.",
      icon: assets.social_icon,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}

      id="services"
      className="relative flex flex-col items-center gap-7 px-4
      sm:px-12 lg:px-40 pt-10 text-gray-700 dark:text-white"
    >
      <img
        src={assets.bgImage2}
        alt=""
        className="absolute -top-110 -left-70 -z-10 dark:hidden"
      />

      <Title
        title="How can we help?"
        desc="From strategy to execution, we craft digital solutions that move your business forward."
      />

      <div className="flex flex-col md:grid grid-cols-2">
        {ServicesData.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default Services;
