import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { shouldShowAd, simulateRemoveAdsPurchase } from "@/services/monetizationService";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";

interface Props {
  placement?: "home" | "planning" | "progress" | "profile";
  onUpgrade?: () => void;
}

export function AdBanner({ placement = "home", onUpgrade }: Props) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    shouldShowAd().then(setVisible);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.banner, { borderColor: colors.border, backgroundColor: colors.badge }]}>
      <Text style={[styles.label, { color: colors.text }]}>Anúncio leve ({placement})</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>
        Continue com o plano gratuito ou remova anúncios permanentemente.
      </Text>
      <View style={styles.actions}>
        <AppButton
          title="Remover anúncios"
          onPress={async () => {
            await simulateRemoveAdsPurchase();
            setVisible(false);
            onUpgrade?.();
          }}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    gap: spacing.xs
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  },
  text: {
    fontSize: 12
  },
  actions: {
    marginTop: spacing.xs,
    alignItems: "flex-start"
  }
});
