"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShadowBackground } from "@/components/ShadowBackground";
import { Compass, BookOpen, MoveRight, ArrowLeft } from "lucide-react";

export default function ScrollMidShowcasePage() {
  const breakRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [midParallaxOffset, setMidParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = breakRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Track container position as it enters viewport (rect.top <= windowHeight),
      // traverses center view, and leaves viewport (rect.bottom >= 0)
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const totalDistance = windowHeight + rect.height;
        const currentDistance = windowHeight - rect.top;
        const progress = Math.max(0, Math.min(1, currentDistance / totalDistance));
        setScrollProgress(progress);

        // Dynamically interpolate vertical parallax offset (-40px to +40px)
        const maxOffsetPx = 40;
        const offset = (progress - 0.5) * 2 * maxOffsetPx;
        setMidParallaxOffset(offset);
      } else if (rect.top > windowHeight) {
        setScrollProgress(0);
        setMidParallaxOffset(-40);
      } else {
        setScrollProgress(1);
        setMidParallaxOffset(40);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500/30">
      {/* LONG-FORM EDITORIAL ARTICLE CONTAINER */}
      <article
        data-testid="editorial-article-container"
        className="w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-24 flex flex-col relative z-10"
      >
        {/* 1. INTRODUCTORY CONTENT */}
        <header className="flex flex-col gap-6 mb-12">
          {/* Editorial Kicker Badge */}
          <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest uppercase bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 backdrop-blur-md shadow-lg">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Design Study 04 • Long-Form Editorial Interlude</span>
          </div>

          {/* Elegant White Editorial Header */}
          <h1
            data-testid="article-title"
            className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white font-light leading-[1.05] drop-shadow-2xl"
          >
            THE ANATOMY OF TEXTURE
          </h1>

          {/* Subtitle / Dek */}
          <p className="text-xl sm:text-2xl font-serif italic text-zinc-300 font-light leading-relaxed max-w-2xl">
            Specular absorption, micro-topography, and the optical resonance of industrial weathering.
          </p>

          {/* Article Metadata Bar */}
          <div
            data-testid="article-metadata"
            className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 pb-6 border-y border-zinc-800/80 text-xs font-mono text-zinc-400"
          >
            <div>
              <span className="text-zinc-500 uppercase">Monograph:</span>{" "}
              <span className="text-zinc-200">Materials Research Group</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase">Published:</span>{" "}
              <span className="text-zinc-200">Autumn 2026</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase">Reading Time:</span>{" "}
              <span className="text-zinc-200">8 min</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase">Classification:</span>{" "}
              <span className="text-amber-400/90 font-medium">Long-Form Feature</span>
            </div>
          </div>
        </header>

        {/* Multi-Paragraph Opening Analysis */}
        <div
          data-testid="introductory-content"
          className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed"
        >
          <p>
            In physical architecture, materiality is not defined by flat pigmentation alone; it is defined by how surfaces interact with passing time, moisture, and shifting light vectors. Over decades of atmospheric exposure, structural steel framing, layered industrial lead paints, and weathered concrete substrates undergo continuous chemical transformation. Oxidation pits the surface, thermal cycling creates microscopic fissures, and successive strata of pigment peel back to expose the geological underpinnings beneath.
          </p>
          <p>
            When natural sunlight illuminates an aged material at an oblique angle, the resulting optical occlusion diverges fundamentally from traditional computer-generated drop shadows. Grazing incident light catches the jagged micro-crests of distressed paint coatings, producing high-frequency occlusion gradients that shift dynamically across the surface plane. The shadow does not simply mask the surface; it penetrates into porous cavities, softening at the periphery through atmospheric ray scattering and edge penumbra diffusion.
          </p>
          <p>
            In digital typography and editorial layouts, conveying this physical presence historically required heavy photographic video loops or taxing WebGL shaders that degrade Largest Contentful Paint (LCP) and rapidly exhaust battery reserves on portable readers. By decoupling an unmoving static Base Plate from a transparent dynamic shadow canvas, editorial publishing interfaces can achieve tactile, authentic depth without sacrificing instantaneous rendering performance or scrolling smoothness.
          </p>
        </div>

        {/* 2. MID-PAGE SHADOW BREAK */}
        <section
          ref={breakRef}
          data-testid="mid-page-shadow-break"
          data-scroll-progress={scrollProgress.toFixed(3)}
          data-parallax-offset={midParallaxOffset.toFixed(1)}
          className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[650px] my-16 overflow-hidden border-y border-neutral-800 shadow-2xl"
        >
          {/* Dynamic Interactive Shadow Canvas Background with Layered Children */}
          <ShadowBackground
            basePlate="/images/decayedpaint-background.webp"
            caster={{ type: "image", src: "/images/grass.svg" }}
            className="absolute inset-0"
            tier="auto"
            offset={{ x: 0, y: Math.round(midParallaxOffset) }}
            motion={{
              preset: "smooth",
              scrollInfluence: 100,
              ambient: true,
              maxDisplacementPx: 45,
            }}
            shadowColor="#050505"
            shadowOpacity={0.85}
            penumbra={26}
          >
            {/* Subtle Vignette & Depth Mask */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/60 pointer-events-none"
              aria-hidden="true"
            />

            {/* Overlay Stylized White Pull-Quote / Caption */}
            <div
              data-testid="mid-page-pullquote"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 sm:p-12 pointer-events-none transition-transform duration-75 ease-out"
              style={{ transform: `translate3d(0, ${midParallaxOffset * -0.3}px, 0)` }}
            >
              <div className="max-w-2xl px-8 py-8 rounded-2xl bg-zinc-950/70 backdrop-blur-md border border-neutral-700/60 shadow-2xl flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-zinc-900/80 border border-neutral-700/80 text-amber-300">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Observation // Viewport Interlude</span>
                </div>

                <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-white leading-snug tracking-tight drop-shadow-lg">
                  “SURFACE DEGREDATION AS A LIGHT-HARVESTING MEDIUM”
                </blockquote>

                <figcaption className="text-xs sm:text-sm font-mono text-zinc-300 tracking-wider uppercase">
                  — Industrial Surface Metallurgy, Archival Monograph
                </figcaption>
              </div>
            </div>
          </ShadowBackground>
        </section>

        {/* 3. CONCLUDING CONTENT */}
        <section
          data-testid="concluding-content"
          className="flex flex-col gap-16 pt-4"
        >
          {/* Chapter II */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Section 02
              </span>
              <div className="h-[1px] flex-1 bg-zinc-800" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">
              II. The Physics of Decoupled Occlusion
            </h2>

            <div className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              <p>
                When examining weathered plaster and decayed lead coatings under grazing laboratory light, one observes that shadows rarely behave like solid flat cuts. Instead, contact hardening manifests at the immediate point of occlusion, while ray divergence blurs distant edges into an atmospheric penumbra. By employing a multi-pass Gaussian convolution filter calibrated to a 26px radius, the dynamic shadow canvas produces the delicate gradient transition characteristic of indirect skylight.
              </p>
              <p>
                Crucially, this synthesis does not mutate or repaint the underlying substrate bitmap. The photographic Base Plate (<code className="text-amber-300 font-mono text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">decayedpaint-background.webp</code>) remains immutable in GPU texture memory, ensuring that the browser never incurs expensive tile re-rasterization during active viewport scrolling. The shadow layer alone (<code className="text-sky-300 font-mono text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">grass.svg</code>) recalculates its perspective transform and multiply blend modes.
              </p>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">100px</div>
              <div className="text-sm font-medium text-zinc-200">Scroll Influence</div>
              <p className="text-xs text-zinc-400 leading-normal">
                Continuous element-relative parallax shift interpolating shadow offset across viewport entry and exit.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">26px</div>
              <div className="text-sm font-medium text-zinc-200">Penumbra Softening</div>
              <p className="text-xs text-zinc-400 leading-normal">
                Multi-pass Gaussian blur mimicking atmospheric light scattering over aged lead-paint crevices.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">0.85</div>
              <div className="text-sm font-medium text-zinc-200">Optical Density</div>
              <p className="text-xs text-zinc-400 leading-normal">
                High-contrast multiply blend preserving photographic pigment micro-textures beneath dark occlusion.
              </p>
            </div>
          </div>

          {/* Chapter III */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Section 03
              </span>
              <div className="h-[1px] flex-1 bg-zinc-800" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">
              III. Viewport-Relative Reading Dynamics
            </h2>

            <div className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              <p>
                In lengthy editorial publications, static photographic inserts often feel lifeless, while video embeds can be jarringly intrusive and battery-draining. An embedded shadow break offers an organic compromise: as the reader scrolls downstream, the container&apos;s entry into the viewport initializes subtle parallax acceleration. The shadow caster glides across the weathered canvas, peaking as the section reaches the vertical midpoint of the display, and softly decelerates as the section exits above.
              </p>
              <p>
                Because the underlying motion controller integrates second-order spring physics, high-velocity scrolls never cause hard snapping or abrupt coordinate jumps. The occluding silhouette maintains physical momentum, harmonizing user-driven scrolling with subtle continuous ambient swaying frequencies.
              </p>
            </div>

            {/* Architecture Details Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800 mt-4">
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Base Plate Substrate</span>
                <span className="text-xs font-mono text-amber-300">decayedpaint-background.webp</span>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Shadow Caster Texture</span>
                <span className="text-xs font-mono text-sky-300">grass.svg</span>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Motion Controller Preset</span>
                <span className="text-xs font-mono text-zinc-300">smooth (stiffness: 120, damping: 14)</span>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Hardware Degradation Tier</span>
                <span className="text-xs font-mono text-emerald-400">auto (Hardware Capability Gated)</span>
              </div>
            </div>
          </div>

          {/* Article Navigation Footer */}
          <footer className="pt-16 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Showcase Gallery</span>
            </Link>

            <Link
              href="/showcase/scroll-top"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white transition-all shadow-lg hover:shadow-zinc-100/10"
            >
              <span>Previous Study: Scroll Top</span>
              <MoveRight className="w-4 h-4" />
            </Link>
          </footer>
        </section>
      </article>
    </div>
  );
}
