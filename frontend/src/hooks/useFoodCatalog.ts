import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import {fetchFoodCatalog} from "@/auth/MealService";

export function useFoodCatalog() {
  const { region } = useAuth();
  return useQuery({
    queryKey: ["food-catalog", region],
    queryFn: () => fetchFoodCatalog(region),
    enabled: Boolean(region),
    staleTime: 1000 * 60 * 60, // catalog is basically static, cache aggressively
  });
}