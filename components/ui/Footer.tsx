'use client'

import Link from 'next/link'
import { Rocket, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const footerLinks = [
  { name: 'Home', href: '/' },
  { name: 'Consultants', href: '/client/consultants' },
  { name: 'About', href: '/about' },
  { name: 'Support', href: '/support' },
]

const socialLinks = [
  { icon: Twitter, href: '#' },
  { icon: Linkedin, href: '#' },
  { icon: Github, href: '#' },
  { icon: Mail, href: 'mailto:support@startedge.com' },
]

export function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-on-primary-container" />
              </div>
              <span className="text-xl font-black text-primary">StartEdge</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Expert advice, right now. Pay per minute.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-surface-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              &copy; 2026 StartEdge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}