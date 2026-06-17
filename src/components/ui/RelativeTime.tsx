import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface RelativeTimeProps {
  timestamp: string;
}

export const RelativeTime: React.FC<RelativeTimeProps> = ({ timestamp }) => {
  const { t } = useTranslation(['dashboard']);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return <>{minutes === 0 ? t('dashboard:labels.mins_ago', { count: 0 }) : t('dashboard:labels.mins_ago', { count: Math.max(1, minutes) })}</>;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return <>{t('dashboard:labels.hours_ago', { count: hours })}</>;
  return <>{t('dashboard:labels.days_ago', { count: Math.floor(hours / 24) })}</>;
};
