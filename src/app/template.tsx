/** Re-mounts on every navigation, so each page slides in gently like an app screen. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="screen">{children}</div>;
}
