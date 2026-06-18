import type { TFunction } from 'i18next';
import type { EventTypeEnum } from '../types';

const PLACEHOLDER_PATTERN = /^\s*(?:\[[A-Z]{2}\]\s*)?\[[^\]]+\]\s*$/;

const humanizeKeyPart = (value: string) =>
  value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const normalizeInsightKey = (key: unknown) =>
  typeof key === 'string' ? key.replace(/^insights\./, '') : '';

const hasInterpolationPlaceholder = (value: unknown) =>
  typeof value === 'string' && /\{\{[^}]+\}\}/.test(value);

const translatedValue = (t: TFunction, key: unknown) => {
  const normalized = normalizeInsightKey(key);
  if (!normalized) return '';

  const translated = t(normalized, {
    ns: 'insights',
    defaultValue: '',
  });

  if (typeof translated === 'string' && translated && !PLACEHOLDER_PATTERN.test(translated)) {
    return translated;
  }

  return '';
};

export const translateInsightLabel = (t: TFunction, key: unknown) => {
  const normalized = normalizeInsightKey(key);
  const field = normalized.split('.').pop() || '';
  if (!field) return '';

  const fallback = t(`common:discovery.insight_labels.${field}`, {
    defaultValue: humanizeKeyPart(field),
  });

  return typeof fallback === 'string' ? fallback : humanizeKeyPart(field);
};

export const translateInsightText = (t: TFunction, key: unknown) => {
  const normalized = normalizeInsightKey(key);
  if (!normalized) return '';

  const translated = translatedValue(t, key);
  if (translated) {
    return translated;
  }

  const field = normalized.split('.').pop() || '';
  const fallback = t(`common:discovery.insight_fallbacks.${field}`, {
    defaultValue: translateInsightLabel(t, key),
  });

  return typeof fallback === 'string' ? fallback : translateInsightLabel(t, key);
};

export const translatePatternLabel = (t: TFunction, key: unknown) => {
  const translated = translatedValue(t, key);
  if (translated) return translated;

  return t('common:discovery.pattern_fallbacks.name', {
    defaultValue: 'Pattern Emerging',
  }) as string;
};

export const translatePatternText = (t: TFunction, key: unknown) => {
  const translated = translatedValue(t, key);
  if (translated) return translated;

  return t('common:discovery.pattern_fallbacks.insight', {
    defaultValue: 'A meaningful pattern is beginning to emerge from these answers.',
  }) as string;
};

export const translatePatternSupportingText = (t: TFunction, key: unknown) => {
  const translated = translatedValue(t, key);
  if (translated) return translated;

  return t('common:discovery.pattern_fallbacks.supporting_text', {
    defaultValue: 'Look for the choices this character repeats when they are trying to protect themselves.',
  }) as string;
};

export const translatePatternNextHint = (t: TFunction, key: unknown) => {
  const translated = translatedValue(t, key);
  if (translated) return translated;

  return t('common:discovery.pattern_fallbacks.next_hint', {
    defaultValue: 'Next, discover what this pattern costs them.',
  }) as string;
};

export const buildEventMetadata = (t: TFunction, eventMetadata: Record<string, unknown>) => {
  const metadata = { ...eventMetadata };

  if (eventMetadata.insight_key) {
    const insightLabel = translateInsightLabel(t, eventMetadata.insight_key);
    const insightText = translateInsightText(t, eventMetadata.insight_key);
    metadata.insight_key = insightText;
    metadata.insight_label = insightLabel;
    metadata.insight_text = insightText;
  }

  if (eventMetadata.pattern_key) {
    const patternLabel = translatePatternLabel(t, eventMetadata.pattern_key);
    metadata.pattern_key = patternLabel;
    metadata.pattern_label = patternLabel;
  }

  if (eventMetadata.pattern_insight) {
    const patternText = translatePatternText(t, eventMetadata.pattern_insight);
    metadata.pattern_insight = patternText;
    metadata.pattern_text = patternText;
  } else if (eventMetadata.insight_key) {
    metadata.pattern_insight = metadata.insight_text;
    metadata.pattern_text = metadata.insight_text;
  }

  return metadata;
};

export const buildDiscoveryEventCopy = (
  t: TFunction,
  eventType: EventTypeEnum,
  eventMetadata: Record<string, unknown>,
) => {
  const metadata = buildEventMetadata(t, eventMetadata);

  if (eventType === 'INSIGHT_UNLOCKED') {
    const insightLabel =
      (metadata.insight_label as string | undefined) ||
      (t('common:discovery.insight_labels.central_conflict', {
        defaultValue: 'Central Conflict',
      }) as string);
    const insightText =
      (metadata.insight_text as string | undefined) ||
      (t('common:discovery.insight_fallbacks.central_conflict', {
        defaultValue:
          'A central conflict is emerging between what protects this character and what the story is asking them to face.',
      }) as string);

    return {
      title: `${t('common:discovery.labels.insight_unlocked', 'Insight Unlocked')}: ${insightLabel}`,
      description: insightText,
    };
  }

  if (eventType === 'PATTERN_EMERGING') {
    const patternLabel =
      (metadata.pattern_label as string | undefined) ||
      (t('common:discovery.pattern_fallbacks.name', {
        defaultValue: 'Pattern Emerging',
      }) as string);
    const patternText =
      (metadata.pattern_text as string | undefined) ||
      (t('common:discovery.pattern_fallbacks.insight', {
        defaultValue: 'A meaningful pattern is beginning to emerge from these answers.',
      }) as string);

    return {
      title: `${t('common:discovery.labels.pattern', 'Pattern')}: ${patternLabel}`,
      description: patternText,
    };
  }

  const title = t(`events:${eventType}`, metadata) as string;
  const description = t(`events:descriptions.${eventType}`, metadata) as string;

  return {
    title: hasInterpolationPlaceholder(title) ? eventType : title,
    description: hasInterpolationPlaceholder(description) ? '' : description,
  };
};
