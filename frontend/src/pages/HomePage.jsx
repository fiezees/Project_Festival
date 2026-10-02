import React from 'react';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import AboutSection from '../components/AboutSection';
import LocationsSection from '../components/LocationsSection';
import TimelineSection from '../components/TimelineSection';
import PrizeSection from '../components/PrizeSection';
import NewsSection from '../components/NewsSection';

export default function HomePage({
  onOpenProposal,
  onNavigateToMap,
  onNavigateToNews,
  onSelectLocationMap,
  onSelectArticle
}) {
  const handleScrollToTimeline = () => {
    const el = document.getElementById('timeline-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="space-y-0">
      <Hero
        onOpenProposal={onOpenProposal}
        onNavigateToMap={onNavigateToMap}
        onScrollToTimeline={handleScrollToTimeline}
      />

      <StatsSection />

      <AboutSection />

      <LocationsSection
        onSelectLocationMap={onSelectLocationMap}
      />

      <TimelineSection
        onOpenProposal={onOpenProposal}
      />

      <PrizeSection
        onOpenProposal={onOpenProposal}
      />

      <NewsSection
        onNavigateToNews={onNavigateToNews}
        onSelectArticle={onSelectArticle}
      />
    </main>
  );
}
