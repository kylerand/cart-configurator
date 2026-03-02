/**
 * Animated price counter component.
 * 
 * Smoothly animates between price values using requestAnimationFrame.
 * Inspired by the Velocity Restorations configurator's price display.
 */

import { useEffect, useRef, useState } from 'react';
import { colors, typography } from '../styles/broncoTheme';

interface AnimatedPriceProps {
  value: number;
  duration?: number;
  prefix?: string;
  style?: React.CSSProperties;
}

export function AnimatedPrice({ value, duration = 400, prefix = '$', style }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span style={{ ...defaultStyle, ...style }}>
      {prefix}{displayValue.toLocaleString()}
    </span>
  );
}

const defaultStyle: React.CSSProperties = {
  fontFamily: typography.fontFamily.display,
  fontSize: typography.sizes.h2,
  color: colors.offWhite,
  letterSpacing: '1px',
};
