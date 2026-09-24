import { useEffect, useRef } from "react";
import { listJobs } from "@/lib/jobs-api";
import { useJobs } from "@/lib/jobs";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function JobsHydrator() {
  const user = useCurrentUser();
  const ran = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (ran.current === user.id) return;
    ran.current = user.id;
    void listJobs()
      .then((jobs) => useJobs.getState().replaceAll(jobs))
      .catch(() => {
        useJobs.setState({ hydrated: true });
      });
  }, [user]);

  return null;
}
