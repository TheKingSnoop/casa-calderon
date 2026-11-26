import { spacePlaceholder } from "@/components/space-placeholder";

// The Photos space (FR-44): a "photo of the week" series, coming later.
const space = spacePlaceholder("photos", {
  title: "Photos",
  description: (name) => `A photo of the week from ${name}'s camera.`,
});

export const dynamicParams = false;
export const generateStaticParams = space.generateStaticParams;
export const generateMetadata = space.generateMetadata;
export default space.Page;
