"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "header";
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={item}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Staggers any <RevealItem> descendants. */
interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}

export function RevealGroup({ children, className, as = "div" }: RevealGroupProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={group}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, className, as = "div" }: Omit<RevealProps, "delay">) {
  const Component = motion[as];
  return (
    <Component className={className} variants={item}>
      {children}
    </Component>
  );
}
