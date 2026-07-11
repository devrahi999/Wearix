'use client';

import { useState, useEffect } from 'react';
import { listenToMarketingSettings, MarketingSettings } from '@/lib/db';
import Link from 'next/link';

export default function TopBanner() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);

  useEffect(() => {
    const unsub = listenToMarketingSettings(setSettings);
    return () => unsub();
  }, []);

  if (!settings || !settings.topBannerActive) return null;

  return (
    <div className="bg-blue-600 text-white text-xs font-semibold py-2 relative z-[60] w-full overflow-hidden flex items-center">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
      `}} />
      <div className="w-full overflow-hidden whitespace-nowrap">
        <span className="animate-marquee px-4">
          {settings.topBannerText}
        </span>
      </div>
    </div>
  );
}
