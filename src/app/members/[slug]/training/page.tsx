import { spacePlaceholder } from "@/components/space-placeholder";

// The Training space (FR-45): routine and progress charts, coming later.
const space = spacePlaceholder("training", {
  title: "Training",
  description: (name) => `${name}'s gym routine and progress.`,
});

export const dynamicParams = false;
export const generateStaticParams = space.generateStaticParams;
export const generateMetadata = space.generateMetadata;
export default space.Page;
