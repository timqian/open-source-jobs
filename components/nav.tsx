"use client";

import { useState } from "react";
import Image from "next/image";
// import { PostJobModal } from "./post-job-modal";

export function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-lg font-semibold hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
              <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="w-8 h-8" unoptimized />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                All repos
              </a>
              <a
                href="/updates"
                className="text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Updates
              </a>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* <PostJobModal /> */}
            <a
              href="https://github.com/timqian/open-source-jobs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.shields.io/github/stars/timqian/open-source-jobs?style=social&label=Star"
                alt="GitHub stars"
                className="h-6"
              />
            </a>
            <a
              href="/rss.xml"
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              aria-label="RSS Feed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
            </a>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-4">
              <a
                href="/"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All repos
              </a>
              <a
                href="/updates"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Updates
              </a>
              <div className="flex flex-col gap-3 px-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                {/* <PostJobModal /> */}
                <a
                  href="https://github.com/timqian/open-source-jobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src="https://img.shields.io/github/stars/timqian/open-source-jobs?style=social&label=Star"
                    alt="GitHub stars"
                    className="h-6"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
