import { z } from "zod";

import { serviceCategories } from "@/types";

export const serviceCategorySchema = z.enum(serviceCategories);

/** `all` is the filter's resting state, not a category. */
export const serviceFilterSchema = z.object({
  category: z.union([z.literal("all"), serviceCategorySchema]).default("all"),
  search: z.string().trim().default(""),
});

export type ServiceFilter = z.infer<typeof serviceFilterSchema>;
export type ServiceCategoryFilter = ServiceFilter["category"];
