import React from 'react';

export const SocialProof: React.FC = () => {
  const partners = [
    { name: 'Walmart', logo: 'Walmart' },
    { name: 'Swiggy', logo: 'SWIGGY' },
    { name: 'netlify', logo: 'netlify' },
    { name: 'BBVA', logo: 'BBVA' },
    { name: 'ATLASSIAN', logo: 'ATLASSIAN' },
  ];

  return (
    <section className="relative w-full border-y border-white/[0.06] bg-[#0d0d12]/50 py-12 backdrop-blur-sm">
      <div className="container mx-auto px-6 text-center">
        
        {/* TRUSTED BY Label */}
        <p className="text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">
          Trusted By
        </p>

        {/* Partner Logos */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-10 md:gap-18 opacity-60 transition-opacity hover:opacity-80">
          {partners.map((partner) => (
            <span
              key={partner.name}
              className="text-lg md:text-xl font-bold tracking-wider text-slate-400 font-sans hover:text-white transition-colors"
            >
              {partner.logo}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
};
