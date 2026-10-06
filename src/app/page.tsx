import { HomeDashboard } from "@/components/home/home-dashboard";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/", "app.name", "app.tagline");

export default function HomePage() {
  return <HomeDashboard />;
}
