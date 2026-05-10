export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header, Footer, ScrollProgress, FloatingButtons, ClientChatbot
  // all return null on /admin/* routes — no CSS hacks needed.
  return <>{children}</>;
}
