export const handleError = ({ error }: { error: unknown }) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Failed to fetch dynamically imported module")) {
    window.location.reload();
  }
};
