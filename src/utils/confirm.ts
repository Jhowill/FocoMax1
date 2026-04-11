import { Alert } from "react-native";

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmLabel = "Confirmar"
) {
  Alert.alert(title, message, [
    {
      text: "Cancelar",
      style: "cancel"
    },
    {
      text: confirmLabel,
      style: "destructive",
      onPress: () => {
        Promise.resolve(onConfirm()).catch(() => {
          Alert.alert("Nao foi possivel concluir", "Tente novamente em alguns segundos.");
        });
      }
    }
  ]);
}
