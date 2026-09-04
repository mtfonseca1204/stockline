import { Button } from "@/components/ui/Button";
import { colors, radii, spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { WalletProvider } from "@/lib/types";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const WALLETS: Array<{ id: WalletProvider; name: string }> = [
  { id: "coinbase", name: "Coinbase Wallet" },
  { id: "metamask", name: "MetaMask" },
  { id: "walletconnect", name: "WalletConnect" },
];

export function WalletModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (hasPosition: boolean) => void;
}) {
  const { connectWallet, enableDemoMode, hasPosition } = useApp();
  const [loading, setLoading] = useState<WalletProvider | null>(null);

  const connect = async (provider: WalletProvider) => {
    setLoading(provider);
    await new Promise((r) => setTimeout(r, 600));
    connectWallet(provider);
    setLoading(null);
    onClose();
    onConnected(hasPosition);
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Connect wallet</Text>
          <Text style={styles.desc}>Base-compatible wallet required.</Text>

          {WALLETS.map((w) => (
            <Pressable
              key={w.id}
              style={styles.row}
              onPress={() => connect(w.id)}
              disabled={!!loading}
            >
              <Text style={styles.rowText}>
                {loading === w.id ? "Connecting…" : w.name}
              </Text>
            </Pressable>
          ))}

          <Button
            title="Enter Demo Mode"
            variant="soft"
            onPress={() => {
              enableDemoMode();
              onClose();
              onConnected(true);
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xxl,
    paddingBottom: 36,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  desc: { fontSize: 13, color: colors.inkMuted, marginBottom: 8 },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    backgroundColor: colors.bgElevated,
  },
  rowText: { color: colors.ink, fontSize: 15, fontWeight: "600" },
});
