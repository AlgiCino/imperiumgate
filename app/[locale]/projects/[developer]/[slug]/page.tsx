import { loadAllProjects } from '@/lib/unifiedDataService';
import { type Locale } from '@/lib/i18n-utils';
import ProjectNotFound from '@/components/project/ProjectNotFound';
import { deriveProjectLatLon } from '@/lib/geo';
import ProjectHero from '@/components/project/ProjectHero';
import KeyStats from '@/components/project/KeyStats';
import SectionNav from '@/components/project/SectionNav';
import Overview from '@/components/project/Overview';
import Gallery from '@/components/project/Gallery';
import Tour3D from '@/components/project/Tour3D';
import VideoBlock from '@/components/project/VideoBlock';
import MapBlock from '@/components/project/MapBlock';
import AmenitiesGrid from '@/components/project/AmenitiesGrid';
import DocsBlock from '@/components/project/DocsBlock';
import Insights from '@/components/project/Insights';
import NewsBlock from '@/components/project/NewsBlock';
import ContactBlock from '@/components/project/ContactBlock';
import RelatedCarousel from '@/components/project/RelatedCarousel';
import ROICalculator from '@/components/ui/ROICalculator';
import type { Project, MapPOI } from '@/lib/types';

// Helper to handle translation objects or strings safely
function translateText(
  v?: { ar?: string; en?: string } | string,
  locale: Locale = 'ar'
): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v[locale] || v.en || v.ar || '';
}

export async function generateStaticParams() {
  // 🚀 DYNAMIC LOADING: Read projects directly from individual JSON files
  const all = await loadAllProjects();
  return all
    .filter((p: any) => p.slug && p.slug.trim() !== '')
    .flatMap((p: any) =>
      ['ar', 'en'].map(locale => ({
        locale,
        developer: p.developer || 'unknown',
        slug: p.slug,
      }))
    );
}

export default async function ProjectDetail({ params }: { params: any }) {
  const resolvedParams = await params;
  const { locale = 'ar', developer, slug } = resolvedParams;
  // 🚀 DYNAMIC LOADING: Read projects directly from individual JSON files
  const all = await loadAllProjects();
  const project = all.find((p: any) => p.developer === developer && p.slug === slug);

  // ✅ إذا المشروع غير موجود، اعرض صفحة افتراضية بالاسم بدل 404
  if (!project) {
    const developerProjects = (all || []).filter((p: any) => p.developer === developer);
    const otherProjects = (all || []).filter((p: any) => p.developer !== developer);
    return <ProjectNotFound developer={developer} slug={slug} developerProjects={developerProjects} otherProjects={otherProjects} />;
  }

  const related = all
    .filter((p: any) => p.developer === project.developer && p.slug !== project.slug)
    .slice(0, 8);

  const { lat, lon } = deriveProjectLatLon(project);

  const hasGallery = !!project.galleryImages?.length;
  const has3D = !!project['3D_TourLink'];
  const hasVideo = !!project.videoLink;
  const hasPDF = !!project.brochurePdfLink;
  const hasAmenities = !!project.amenities?.length;
  const hasInsights = !!project.insights;
  const hasNews = Array.isArray(project.news) && project.news.length > 0;
  const hasContact = !!project.contact;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-light">
      <ProjectHero project={project} />
      <div className="max-w-6xl mx-auto px-6">
        <KeyStats project={project} locale={locale} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <ROICalculator project={project} locale={locale} />
      </div>

      <SectionNav project={project} locale={locale} />

      <div id="overview" className="max-w-6xl mx-auto px-6 py-16">
        <Overview project={project} locale={locale} />
      </div>

      {hasGallery && (
        <div id="gallery" className="max-w-6xl mx-auto px-6 py-16">
          <Gallery
            images={project.galleryImages!}
            title={translateText(project.projectName, locale) || project.slug}
          />
        </div>
      )}

      {has3D && (
        <div id="tour3d" className="max-w-6xl mx-auto px-6 py-16">
          <Tour3D url={project['3D_TourLink']!} />
        </div>
      )}

      {hasVideo && (
        <div id="video" className="max-w-6xl mx-auto px-6 py-16">
          <VideoBlock
            src={project.videoLink!}
            poster={project.heroImage || project.galleryImages?.[0]}
          />
        </div>
      )}

      {(lat && lon) && (
        <div id="map" className="max-w-6xl mx-auto px-6 py-16">
          <MapBlock
            project={project}
            lat={lat}
            lon={lon}
            zoom={14}
            showFilters={false}
            locale={locale}
          />
        </div>
      )}

      {hasAmenities && (
        <div id="amenities" className="max-w-6xl mx-auto px-6 py-16">
          <AmenitiesGrid amenities={project.amenities!} locale={locale} />
        </div>
      )}

  <div id="docs" className="max-w-6xl mx-auto px-6 py-16">
    {hasPDF || hasGallery ? (
      <DocsBlock
        brochureUrl={project.brochurePdfLink}
        galleryImages={project.galleryImages || []}
        projectName={
          translateText(project.projectName, locale) || project.slug
        }
      />
    ) : (
      <ProjectNotFound
        developer={developer}
        slug={slug}
        developerProjects={all.filter((p: any) => p.developer === project.developer)}
        otherProjects={all.filter((p: any) => p.developer !== project.developer)}
      />
    )}
  </div>

      {hasInsights && (
        <div id="insights" className="max-w-6xl mx-auto px-6 py-16">
          <Insights text={translateText(project.insights, locale)} />
        </div>
      )}

      {hasNews && (
        <div id="news" className="max-w-6xl mx-auto px-6 py-16">
          <NewsBlock news={project.news || []} locale={locale} />
        </div>
      )}

      {hasContact && (
        <div id="contact" className="max-w-6xl mx-auto px-6 py-16">
          <ContactBlock
            contact={project.contact}
            projectName={
              translateText(project.projectName, locale) || project.slug
            }
            developer={project.developer}
            slug={project.slug}
          />
        </div>
      )}

      {/* ✅ خريطة المطور — مرة واحدة فقط */}
      <div id="developer-projects" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gold-gradient mb-4">
            {locale === 'ar'
              ? `مشاريع ${project.developer}`
              : `${project.developer} Projects`}
          </h2>
          <p className="text-white/70">
            {locale === 'ar'
              ? 'استكشف جميع مشاريع المطور في المنطقة مع دائرة نصف قطرها 400 متر'
              : 'Explore all developer projects in the area with a 400m radius'}
          </p>
        </div>
        <MapBlock
          lat={project.latitude || lat || 25.2048}
          lon={project.longitude || lon || 55.2708}
          zoom={12}
          project={project}
          showFilters={false}
          locale={locale}
        />
      </div>

      {related.length > 0 && (
        <div id="related" className="max-w-6xl mx-auto px-6 py-16">
          <RelatedCarousel projects={related} locale={locale} />
        </div>
      )}
    </div>
  );
}
