import React from 'react'
import { motion } from 'motion/react'

import logo from '../assets/Tradepredict_logo.png'
import logoDark from '../assets/dark_logo.png'

import assets from '../assets/assets'

const Footer = ({ theme }) => {
  const currentLogo = theme === 'dark' ? logoDark : logo

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className='bg-slate-50 dark:bg-gray-900
      pt-10 mt-20 sm:mt-40
      px-4 sm:px-10 lg:px-24 xl:px-40'
    >
      {/* ================= FOOTER TOP ================= */}
      <div className='flex justify-between lg:items-center max-lg:flex-col gap-10'>

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className='space-y-5 text-sm text-gray-700 dark:text-gray-400'
        >
          <img
            src={currentLogo}
            alt="Trade Predict Logo"
            className='w-32 sm:w-44'
          />

          <p className='max-w-md'>
            From strategy to execution, we craft digital solutions that move
            your business forward.
          </p>

          <ul className='flex gap-8'>
            <li><a href="#hero" className='hover:text-primary'>Home</a></li>
            <li><a href="#services" className='hover:text-primary'>Services</a></li>
            <li><a href="#contact-us" className='hover:text-primary'>Contact Us</a></li>
          </ul>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className='text-gray-600 dark:text-gray-400'
        >
          <h3 className='font-semibold'>Subscribe to our newsletter</h3>
          <p className='text-sm mt-2 mb-6'>
            The latest news, articles, and resources, sent to your inbox weekly
          </p>

          <div className='flex gap-2 text-sm'>
            <input
              type="email"
              placeholder='Enter your email'
              className='w-full p-3 rounded outline-none
              bg-transparent border border-gray-300 dark:border-gray-500
              dark:text-gray-200'
            />
            <button className='bg-primary text-white px-6 rounded'>
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>

      <hr className='border-gray-300 dark:border-gray-600 my-6' />

      {/* ================= FOOTER BOTTOM ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className='pb-6 text-sm text-gray-500
        flex flex-wrap items-center
        justify-center sm:justify-between gap-6'
      >
        {/* Logo + Copyright */}
        <div className='flex items-center gap-3'>
          <img
            src={currentLogo}
            alt="Trade Predict Logo"
            className='w-24'
          />
          <p>© 2026 Trade Predict. All Rights Reserved</p>
        </div>

       
      </motion.div>
    </motion.div>
  )
}

export default Footer
