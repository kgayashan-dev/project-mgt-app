"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

const Hero = () => {
  useEffect(() => {
    // Create custom cursor
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    cursor.style.cssText = `
      width: 20px;
      height: 20px;
      border: 2px solid #3B82F6;
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.1s ease-out;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);

    // Create cursor trailer effect
    const trailer = document.createElement("div");
    trailer.classList.add("cursor-trailer");
    trailer.style.cssText = `
      width: 8px;
      height: 8px;
      background: #3B82F6;
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9998;
      transition: all 0.15s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(trailer);

    const moveCursor = (e: MouseEvent) => {
      const { pageX, pageY } = e;
      cursor.style.left = `${pageX}px`;
      cursor.style.top = `${pageY}px`;

      // Add slight delay to trailer
      setTimeout(() => {
        trailer.style.left = `${pageX}px`;
        trailer.style.top = `${pageY}px`;
      }, 100);
    };

    document.addEventListener("mousemove", moveCursor);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.body.removeChild(cursor);
      document.body.removeChild(trailer);
    };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="text-center md:text-left md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
              <TypeAnimation
                sequence={[
                  "A dynamic name reflecting real-time project monitoring...",
                  1000,
                  "Track progress in real-time...",
                  1000,
                  "Manage projects efficiently...",
                  1000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
              />
            </h1>
            <p className="text-sm text-gray-700 max-w-2xl">
              Stay connected to your projects with real-time insights and
              streamlined management for improved efficiency and success.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Get Started
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-50 transform hover:scale-105 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
          {/* Enhanced Image Content */}
          <div className="md:w-[45%] relative">
            {" "}
            <div className="relative w-full h-[400px] transform hover:scale-105 transition-all duration-300">
              {" "}
              <Image
                src="/project.png"
                alt="Project Management Illustration"
                fill
                className="object-contain rounded-lg"
                priority
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>
      </div>
    </section>
  );
};

export default Hero;
