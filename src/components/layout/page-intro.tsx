import { HeroFade } from "@/components/home/hero-copy";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

/** Shared page header for the secondary pages. */
export function PageIntro({ eyebrow, title, children, className }: PageIntroProps) {
  return (
    <header className={cn("atmosphere grain border-b border-line", className)}>
      <div className="container-page pb-12 pt-14 sm:pb-16 sm:pt-20">
        <HeroFade>
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="display mt-4 max-w-4xl text-[clamp(2.6rem,7vw,5.2rem)]">{title}</h1>
        </HeroFade>
        {children ? (
          <HeroFade delay={0.15} className="mt-6 max-w-2xl text-[1.08rem] leading-relaxed text-ink-soft">
            {children}
          </HeroFade>
        ) : null}
      </div>
    </header>
  );
}
