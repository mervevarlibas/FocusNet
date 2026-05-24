import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { appApi } from '../api/client';
import { HeroHeader, Screen, SectionTitle } from '../components/ui';
import { DashboardSkeleton } from '../components/Skeleton';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function startWeekday(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function CalendarScreen() {
  const { theme } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [sessionMap, setSessionMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appApi.calendar(year, month);
      setSessionMap(data.sessionMap || {});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y--;
    }
    if (m > 12) {
      m = 1;
      y++;
    }
    setMonth(m);
    setYear(y);
  }

  const totalDays = daysInMonth(year, month);
  const start = startWeekday(year, month);
  const cells: (number | null)[] = [...Array(start).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <Screen scroll>
      <HeroHeader title="Takvim" subtitle="Aylık çalışma geçmişin" />

      <View style={[styles.nav, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.arrow}>
          <Text style={[styles.arrowText, { color: theme.primary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {MONTHS[month - 1]} {year}
        </Text>
        <Pressable onPress={() => shiftMonth(1)} style={styles.arrow}>
          <Text style={[styles.arrowText, { color: theme.primary }]}>›</Text>
        </Pressable>
      </View>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <View style={styles.weekRow}>
            {DAYS.map((d) => (
              <Text key={d} style={[styles.weekDay, { color: theme.muted }]}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day == null) {
                return <View key={`e-${i}`} style={styles.cell} />;
              }
              const pad = String(month).padStart(2, '0');
              const dayPad = String(day).padStart(2, '0');
              const key = `${year}-${pad}-${dayPad}`;
              const mins = sessionMap[key] || 0;
              const studied = mins > 0;
              return (
                <View
                  key={key}
                  style={[
                    styles.cell,
                    studied && { backgroundColor: theme.highlight, borderColor: theme.primary },
                    { borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={[styles.dayNum, { color: theme.text }]}>{day}</Text>
                  {studied ? (
                    <Text style={[styles.dayMins, { color: theme.primary }]}>{mins}dk</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
          <SectionTitle>Renkli günler = çalışıldı</SectionTitle>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  arrow: { padding: 8, minWidth: 44, alignItems: 'center' },
  arrowText: { fontSize: 28, fontWeight: '300' },
  monthTitle: { ...typography.h2 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', ...typography.caption, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 4,
    padding: 2,
  },
  dayNum: { ...typography.caption, fontWeight: '700' },
  dayMins: { fontSize: 9, fontWeight: '700', marginTop: 2 },
});
