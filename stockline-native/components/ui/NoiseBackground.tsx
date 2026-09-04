import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

/** Animated film-grain flicker + soft lime wash */
export function NoiseBackground() {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(a, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0.6,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0.15,
          duration: 240,
          useNativeDriver: true,
        }),
      ])
    );
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(b, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(b, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    );
    flicker.start();
    drift.start();
    return () => {
      flicker.stop();
      drift.stop();
    };
  }, [a, b]);

  const grainOpacity = a.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.32],
  });
  const grainOpacityB = a.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.08],
  });
  const driftX = b.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 10],
  });
  const driftY = b.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -8],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.glow} />
      <Animated.View
        style={[
          styles.grainA,
          {
            opacity: grainOpacity,
            transform: [{ translateX: driftX }, { translateY: driftY }],
          },
        ]}
      />
      <Animated.View style={[styles.grainB, { opacity: grainOpacityB }]} />
      <View style={styles.speckRow}>
        {Array.from({ length: 28 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.speck,
              {
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: i % 2 === 0 ? 0.18 : 0.1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    top: -120,
    left: "-5%",
    right: "-5%",
    height: 300,
    borderRadius: 240,
    backgroundColor: "rgba(184,240,0,0.1)",
  },
  grainA: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  grainB: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  speckRow: {
    ...StyleSheet.absoluteFill,
  },
  speck: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#fff",
  },
});
