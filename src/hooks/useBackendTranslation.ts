import { useTranslation } from 'react-i18next';

export const useBackendTranslation = () => {
  const { t } = useTranslation();

  const translateEvent = (title: string, description: string) => {
    let translatedTitle = title;
    let translatedDescription = description;

    // Pattern matching for Title
    if (title === 'Character Discovered') translatedTitle = t('events.Character Discovered');
    else if (title === 'Relationship Formed') translatedTitle = t('events.Relationship Formed');
    else if (title === 'Character Report Generated') translatedTitle = t('events.Character Report Generated');
    else if (title === 'Relationship Report Generated') translatedTitle = t('events.Relationship Report Generated');
    else if (title === 'Discovery Answered') translatedTitle = t('events.Discovery Answered');
    else if (title.startsWith('Pattern: ')) {
      const name = title.replace('Pattern: ', '');
      translatedTitle = t('events.Pattern: {{name}}', { name });
    }
    else if (title === 'Insight Unlocked: Central Conflict') translatedTitle = t('events.Insight Unlocked: Central Conflict');

    // Pattern matching for Description
    if (description.startsWith('You added ') && description.endsWith(' to the story.')) {
      const name = description.slice(10, -14);
      translatedDescription = t('events.You added {{name}} to the story.', { name });
    }
    else if (description.startsWith('A connection between ') && description.endsWith(' was established.')) {
      const parts = description.slice(21, -17).split(' and ');
      if (parts.length === 2) {
        translatedDescription = t('events.A connection between {{charA}} and {{charB}} was established.', { charA: parts[0], charB: parts[1] });
      }
    }
    else if (description.startsWith('Generated architecture report for ') && description.endsWith('.')) {
      const name = description.slice(34, -1);
      translatedDescription = t('events.Generated architecture report for {{name}}.', { name });
    }
    else if (description.startsWith('Generated relationship report for ') && description.endsWith('.')) {
      const name = description.slice(34, -1);
      translatedDescription = t('events.Generated relationship report for {{name}}.', { name });
    }

    return { title: translatedTitle, description: translatedDescription };
  };

  return { translateEvent };
};
