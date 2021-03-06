import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  const router = useRouter();
  const [{ fetching, data }] = useMeQuery();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.push("/login?next=/create-post");
    }
  }, [data, router, fetching]);
};
