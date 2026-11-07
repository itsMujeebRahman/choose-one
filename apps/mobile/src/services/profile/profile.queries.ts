import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  type UpdateProfileInput,
  type UserProfile,
} from "./profile.service";

export const profileKeys = {
  current: ["profile"] as const,
};

export function useProfileQuery() {
  return useQuery<UserProfile>({
    queryKey: profileKeys.current,
    queryFn: getProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, Error, UpdateProfileInput>({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.current, updated);
      queryClient.invalidateQueries({ queryKey: profileKeys.current });
    },
  });
}
