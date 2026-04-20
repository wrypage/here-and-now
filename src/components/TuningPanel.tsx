import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AltitudeMode } from '../types/scene';
import { useAppStore } from '../state/appStore';
import { colors } from '../theme/colors';

type TuningPanelProps = {
  onClose: () => void;
};

const ALTITUDE_OPTIONS: Array<{ label: string; value: AltitudeMode | null }> = [
  { label: 'AUTO',    value: null },
  { label: 'SKY',     value: 'sky' },
  { label: 'DAY',     value: 'ground-day' },
  { label: 'NIGHT',   value: 'ground-night' },
  { label: 'ORBITAL', value: 'orbital' },
];

const QUICK_HOURS = [
  { label: '2AM', value: 2 },
  { label: '8AM', value: 8 },
  { label: '2PM', value: 14 },
  { label: '8PM', value: 20 },
];

export function TuningPanel({ onClose }: TuningPanelProps): React.ReactElement {
  const { devForceAltitude, devForceHour, setDevForceAltitude, setDevForceHour } = useAppStore();

  const currentHour = devForceHour ?? new Date().getHours();

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TUNING MODE</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeLabel}>CLOSE ×</Text>
          </TouchableOpacity>
        </View>

        {/* Altitude override */}
        <Text style={styles.sectionLabel}>ALTITUDE MODE</Text>
        <View style={styles.buttonRow}>
          {ALTITUDE_OPTIONS.map((opt) => {
            const active = devForceAltitude === opt.value;
            return (
              <Pressable
                key={String(opt.value)}
                style={[styles.altBtn, active && styles.altBtnActive]}
                onPress={() => setDevForceAltitude(opt.value)}
              >
                <Text style={[styles.altBtnText, active && styles.altBtnTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Hour override */}
        <Text style={styles.sectionLabel}>
          HOUR OVERRIDE{devForceHour !== null ? ` — ${String(devForceHour).padStart(2, '0')}:00` : ' — AUTO'}
        </Text>

        {/* Quick hours */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.altBtn, devForceHour === null && styles.altBtnActive]}
            onPress={() => setDevForceHour(null)}
          >
            <Text style={[styles.altBtnText, devForceHour === null && styles.altBtnTextActive]}>
              AUTO
            </Text>
          </Pressable>
          {QUICK_HOURS.map((q) => (
            <Pressable
              key={q.value}
              style={[styles.altBtn, devForceHour === q.value && styles.altBtnActive]}
              onPress={() => setDevForceHour(q.value)}
            >
              <Text style={[styles.altBtnText, devForceHour === q.value && styles.altBtnTextActive]}>
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Fine hour control */}
        <View style={styles.hourStepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setDevForceHour(((currentHour - 1 + 24) % 24))}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.hourDisplay}>
            {devForceHour !== null
              ? `${String(devForceHour).padStart(2, '0')}:00`
              : `--:--`}
          </Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setDevForceHour(((currentHour + 1) % 24))}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject as object,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: 'rgba(8,9,11,0.93)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 2,
  },
  closeLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  sectionLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  altBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
  },
  altBtnActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  altBtnText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  altBtnTextActive: {
    color: '#08090b',
  },
  hourStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 18,
    color: colors.white,
  },
  hourDisplay: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 22,
    color: colors.white,
    minWidth: 80,
    textAlign: 'center',
  },
});
