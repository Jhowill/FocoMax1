import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { shouldShowAd, simulateRemoveAdsPurchase } from "@/services/monetizationService";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/spacing";
import { elevation, radius } from "@/theme/shape";
import { typography } from "@/theme/typography";

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
    <View style={[styles.banner, { borderColor: colors.border, backgroundColor: colors.cardSecondary, shadowColor: colors.shadow }]}>
      <Text style={[styles.label, { color: colors.text }]}>Espaco patrocinado ({placement})</Text>
      <Text style={[styles.text, { color: colors.mutedText }]}>
        O plano gratuito exibe poucos anuncios em momentos seguros. No Premium, sua experiencia fica 100% limpa.
      </Text>
      <View style={styles.actions}>
        <AppButton
          title="Remover anuncios para sempre"
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
    borderWidth: 1.2,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...elevation.sm
  },
  label: {
    ...typography.overline
  },
  text: {
    ...typography.small
  },
  actions: {
    marginTop: spacing.sm,
    alignItems: "flex-start"
  }
});
