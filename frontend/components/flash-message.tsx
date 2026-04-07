interface FlashMessageProps {
  type: "success" | "error";
  message?: string;
}

export function FlashMessage({ type, message }: FlashMessageProps) {
  if (!message) {
    return null;
  }

  return <p className={`flash-message ${type}`}>{message}</p>;
}
